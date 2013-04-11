class SubjectsController < ApplicationController
  before_filter :get_item, only: :show

  layout :layout_for_region_or_sector

  private

  def get_item
    @item          = @main.find_subject_by_id(params[:id])
    @related_items = @main.subjects
    @subitems      = if @main.type == 'region'
                       @item.sectors.select{|s| s.regions.map(&:id).include?(@main.id)}
                     else
                       @item.regions.select{|r| r.sectors.map(&:id).include?(@main.id)}
                     end
  end
end
