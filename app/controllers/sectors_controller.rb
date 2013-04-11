class SectorsController < ApplicationController
  before_filter :get_item, only: :show

  layout :layout_for_region_or_sector

  private

  def get_item
    @item          = @main.find_sector_by_id(params[:id])
    @related_items = @main.sectors
    @subitems      = @item.subjects
  end
end

