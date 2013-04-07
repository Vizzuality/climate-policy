class SectorsController < ApplicationController
  before_filter :get_item, only: :show

  private

  def get_item
    @item = @main.find_sector_by_id(params[:id])
  end
end
