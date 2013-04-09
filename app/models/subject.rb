class Subject < ActiveYaml::Base
  set_root_path "db"
  set_filename "data"

  fields :id, :name, :description, :region_id, :sector_id, :graph_config

  def self.find_by_id_region_id_and_sector_id(id, region_id, sector_id)
    Region.find_by_id(region_id).find_subject_by_id(id, sector_id)
  end

  def previous
    previous_index = current_index - 1

    if previous_index > -1
      previous_index_id = related_subjects[previous_index].first
      return Subject.find_by_id_region_id_and_sector_id(previous_index_id, region_id, sector_id)
    end

    nil
  end

  def next
    next_index = current_index + 1

    if next_index < related_subjects.length
      next_index_id = related_subjects[next_index].first
      return Subject.find_by_id_region_id_and_sector_id(next_index_id, region_id, sector_id)
    end

    nil
  end

  def type
    self.class.name.downcase
  end

  def graph_configs
    GraphConfig.find graph_config
  end

  private

  def current_index
    related_subjects.index([id, attributes.slice(:name, :description, :graph_config).stringify_keys])
  end

  def related_subjects
    @related_subjects ||= self.class.find_by_id(region_id).sectors.select{|s| s == sector_id}[sector_id]['subjects'].to_a
  end

end
