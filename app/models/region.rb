class Region < ActiveYaml::Base
  set_root_path "db"
  set_filename "data"

  def first_subject
    sectors.first.subjects.first.first
  end

  def subjects
    sectors.map(&:subjects).flatten.uniq.first
  end

  def sectors
    self[:sectors].map{|s_id, s| Sector.new({id: s_id, region_id: id}.merge(s))}
  end

  def type
    self.class.name.downcase
  end

  def find_subject_by_id(subject_id, sector_id = nil)
    Subject.new({id: subject_id, region_id: id, sector_id: sector_id || sectors.first.id}.merge(sectors.first.subjects[subject_id]))
  end

  def find_sector_by_id(sector_id)
    sectors.select{|s| s.id == sector_id}.first
  end

  def previous
    previous_index = current_index - 1

    if previous_index > -1
      previous_index_id = related_regions[previous_index].id
      return Sector.find_by_id(previous_index_id)
    end

    nil
  end

  def next
    next_index = current_index + 1

    if next_index < related_regions.length
      next_index_id = related_regions[next_index].id
      return Sector.find_by_id(next_index_id)
    end

    nil
  end

  def graph_configs(sector_id, subject_id)
    GraphConfig.for(id, sector_id, subject_id)
  end

  private

  def current_index
    related_regions.index(self)
  end

  def related_regions
    @related_regions ||= Region.all
  end

end
