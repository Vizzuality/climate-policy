class Subject < ActiveYaml::Base
  set_root_path "db"
  set_filename "subjects"

  def type
    self.class.name.downcase
  end

  def find_region_by_id(id)
    regions.select{|s| s.id == id}.first
  end

  def find_sector_by_id(id)
    sectors.select{|s| s.id == id}.first
  end

  def regions
    self[:regions].map do |r|
      region = Region.find(r.keys.first)
      region.custom_description = r.values.first['description']
      region
    end
  end

  def sectors
    self[:sectors].map do |s|
      sector = Sector.find(s.keys.first)
      sector.description = s.values.first['description']
      sector.tagline = s.values.first['tagline']
      sector.decades_analysis = s.values.first['decades_analysis']
      sector
    end
  end

end
