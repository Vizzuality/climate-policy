class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :get_regions_data, only: :show
  before_filter :get_sectors_data, only: :show
  before_filter :get_item_data, only: :show

  helper_method :main_type
  helper_method :main_is_region?
  helper_method :main_is_sector?
  helper_method :item_is_region?
  helper_method :item_is_sector?
  helper_method :item_is_subject?

  def data
    require 'net/http'
    cdb_api_key = 'eca1902cb724e40fdb20fd628b47489b15134d79'
    cdb_url = 'http://cpi.cartodb.com/api/v2/sql'

    sql_regex = [
      /^SELECT \* FROM [a-zA-Z0-9-_]+ order by [a-zA-Z0-9-_]+\s?$/,
      /^SELECT \* FROM [a-zA-Z0-9-_]+\s?$/,
      /^SELECT (min|max)\((min|max)\) as (min|max), (min|max)\((min|max)\) as (min|max) FROM \((SELECT (min|max)\([a-zA-Z0-9-_]+\) as (min|max), (min|max)\([a-zA-Z0-9-_]+\) as (min|max) FROM [a-zA-Z0-9-_]+( UNION )?)+\) as aux\s?$/
    ]

    regex_ok = false
    sql_regex.each do |reg|
      regex_ok = true if reg.match params[:q]
    end

    if not regex_ok
      render :status => 404, :text => 'Query not allowed'
      return
    end

    uri = URI(cdb_url)
    cdb_params = Hash.new
    cdb_params[:q] = params[:q] if not params[:q].blank?
    cdb_params[:api_key] = cdb_api_key if not cdb_api_key.blank?
    uri.query = URI.encode_www_form(cdb_params)
    res = Net::HTTP.get_response(uri)
    render :text => res.body
  end

  protected

  def layout_for_region_or_sector
    main_type.pluralize unless request.xhr?
  end

  def get_regions_data
    if params[:region_id]
      @region  = Region.find(params[:region_id])
      @main    = @region
      @regions = Region.all
    end
  end

  def get_sectors_data
    if params[:sector_id]
      @sector  = Sector.find(params[:sector_id]).freeze
      @region  = @sector.regions.first
      @main    = @sector.freeze
      @regions = Region.all
    end
  end

  def get_item_data
    @graph_configs      = GraphConfig.all.as_json.map{|gp| gp['attributes']}
    @sectors_or_regions = if main_is_region?
                            @region.sectors
                          else
                            @sector.regions
                          end
  end

  def main_type
    @main.type
  end

  def main_is_region?
    main_type == 'region'
  end

  def main_is_sector?
    main_type == 'sector'
  end

  def item_is_region?
    @item.type == 'region'
  end

  def item_is_sector?
    @item.type == 'sector'
  end

  def item_is_subject?
    @item.type == 'subject'
  end

end
