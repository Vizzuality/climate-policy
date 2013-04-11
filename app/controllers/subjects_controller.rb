class SubjectsController < ApplicationController
  before_filter :get_item, only: :show

  private

  def get_item
    @item          = @main.find_subject_by_id(params[:id])
    @related_items = @main.subjects
    @subitems      = if @main.type == 'region'
                       @item.sectors
                     else
                       @item.regions
                     end
  end
end
