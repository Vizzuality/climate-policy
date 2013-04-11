class Region < ActiveYaml::Base
  set_root_path "db"
  set_filename "regions"

  fields :id,
         :name,
         :tagline,
         :description,
         :custom_description,
         :sectors,
         :subjects

  def type
    self.class.name.downcase
  end

  def find_sector_by_id(id)
    sectors.select{|s| s.id == id}.first
  end

  def find_subject_by_id(id)
    subjects.select{|s| s.id == id}.first
  end

  def sectors
    self[:sectors].map do |s|
      sector = Sector.find(s.keys.first)
      sector.custom_description = s.values.first['description']
      sector.decades_analysis   = s.values.first['decades_analysis']
      sector
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
