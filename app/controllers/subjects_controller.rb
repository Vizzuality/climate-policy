class SubjectsController < ApplicationController
  before_filter :get_item, only: :show

  private

  def get_item
    @item = @main.find_subject_by_id(params[:id])
    @items = if @main.type == 'region'
               @main.sectors
             else
               Region.all
             end
  end
end
