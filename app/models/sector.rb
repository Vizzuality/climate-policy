class Sector < ActiveYaml::Base
  set_root_path "db"
  set_filename "sectors"

  def type
    self.class.name.downcase
  end

  def find_region_by_id(id)
    regions.select{|s| s.id == id}.first
  end

  def find_subject_by_id(id)
    subjects.select{|s| s.id == id}.first
  end

  def regions
    self[:regions].map do |r|
      region = Region.find(r.keys.first)
      region.description = r.values.first['description']
      region
    end
  end

  def subjects
    self[:subjects].map do |s|
      subject = Subject.find(s.keys.first)
      subject.description = s.values.first['description']
      subject
    end
  end

end
