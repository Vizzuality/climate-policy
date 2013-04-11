class RegionsController < ApplicationController
  before_filter :get_item, only: :show

  layout :layout_for_region_or_sector

  private

  def get_item
    @item          = @main.find_region_by_id(params[:id])
    @related_items = @main.regions
    @subitems      = @item.subjects
  end
end
