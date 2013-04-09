class GraphConfig < ActiveYaml::Base
  set_root_path "db"
  set_filename "graph_config"

  def self.for(region_id, sector_id, subject_id)
    config = Region.find(region_id).sectors.select{|s| s.id == sector_id}.first.find_subject_by_id(subject_id).graph_config
    GraphConfig.find(config)
  end
end
