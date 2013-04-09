class GraphConfig < ActiveYaml::Base
  set_root_path "db"
  set_filename "graph_config"

  def self.for(region_id, sector_id, subject_id)
    region = Region.find(region_id) rescue nil
    if region
      config = region.sectors.select{|s| s.id == sector_id}.first.find_subject_by_id(subject_id).graph_config
    else
      sector = Sector.find_by_id(region_id)
      config = sector.find_subject_by_id(subject_id).graph_config
    end

    GraphConfig.find(config)
  end
end
