class GraphConfig < ActiveYaml::Base
  set_root_path "db"
  set_filename "graph_config"


fields :id,
       :region_id,
       :sector_id,
       :subject_id,
       :name,
       :description,
       :table,
       :x_axis,
       :series,
       :description_long,
       :type,
       :units,
       :name_column,
       :x_groups


  def self.for(region_id, sector_id, subject_id)
    GraphConfig.find_all_by_region_id_and_sector_id_and_subject_id(region_id, sector_id, subject_id)
  end
end
