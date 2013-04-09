class RegionsController < ApplicationController
  before_filter :get_item, only: :show

  private

  def get_item
    @item = Region.find_by_id(params[:id])
    @items = @main.subjects.map{|id, subject_attributes| Subject.new(subject_attributes)}
  end
end
