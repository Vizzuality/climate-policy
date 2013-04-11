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
