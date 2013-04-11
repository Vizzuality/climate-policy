module ApplicationHelper

  def previous_item(item)
    current_index = @related_items.index(item)
    return @related_items[current_index - 1] if current_index > 0
    nil
  end

  def next_item(item)
    current_index = @related_items.index(item)
    return @related_items[current_index + 1] if current_index < (@related_items.length - 1)
    nil
  end

  def graphs_for_subitem(subitem)
    region_id = nil
    sector_id = nil
    subject_id = nil

    if main_is_region?
      region_id = @main.id

      if item_is_sector?
        sector_id = @item.id
        subject_id = subitem.id
      else
        sector_id = subitem.id
        subject_id = @item.id
      end
    else
      sector_id = @main.id

      if item_is_region?
        region_id = @item.id
        subject_id = subitem.id
      else
        subject_id = @item.id
        region_id = subitem.id
      end
    end

    GraphConfig.for(region_id, sector_id, subject_id)
  end

  def description_for(item)
    if item.respond_to?(:custom_description)
      return item.custom_description
    end
    item.description
  end
end

