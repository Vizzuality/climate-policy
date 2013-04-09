class Sector < ActiveYaml::Base
  set_root_path "db"
  set_filename "data"

  fields :id, :name, :tagline, :description, :subjects, :region_id, :graph_config

  def self.find_by_id(sector_id)
    Region.all.first.sectors.select{|s| s.id == sector_id}.first
  end

  def self.find_by_region(region_id)
    find(region_id).
      sectors.
      map{|sector_id, sector| Sector.new({id: sector_id, region_id: region_id}.merge(sector))}
  end

  def self.find_by_id_and_region_id(sector_id, region_id)
    Region.find_by_id(region_id).find_sector_by_id(sector_id)
  end

  def find_subject_by_id(subject_id, sector_id = nil)
    Subject.new({id: subject_id, region_id: Region.first.id, sector_id: id}.merge(subjects[subject_id]))
  end

  def regions
    Region.all.select{|r| r.sectors.map(&:id).include?(id)}
  end

  def previous
    previous_index = current_index - 1

    if previous_index > -1
      previous_index_id = related_sectors[previous_index].id
      return Sector.find_by_id_and_region_id(previous_index_id, region_id)
    end

    nil
  end

  def next
    next_index = current_index + 1

    if next_index < related_sectors.length
      next_index_id = related_sectors[next_index].id
      return Sector.find_by_id_and_region_id(next_index_id, region_id)
    end

    nil
  end

  def type
    self.class.name.downcase
  end

  def graph_configs(region_or_sector_id, subject_id)
    GraphConfig.for(region_or_sector_id, id, subject_id)
  end

  private

  def current_index
    related_sectors.index(self)
  end

  def related_sectors
    @related_sectors ||= Region.find_by_id(region_id).sectors
  end

end
