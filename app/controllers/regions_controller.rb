class RegionsController < ApplicationController
  before_filter :get_item, only: :show

  private

  def get_item
    @item          = @main.find_region_by_id(params[:id])
    @related_items = @main.regions
    @subitems      = @item.subjects
  end
end
