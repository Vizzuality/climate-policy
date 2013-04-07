var datasets = {
  "sectors": [
    { "name": "emissions",
      "subjects": [
        {
          "name": "Deforestation rate",
          "table": "deforestation_rate_copy_test_matallo",
          "description": "",
          "x_axis": "date_processed",
          "series": [
            { "name": "Deforestation rate", "column": "units_km2_year", "class": "line", "y_extent": [0,30000], "strokeColor": "#546DBC" }
          ]
        },
        {
          "name": "Emissions",
          "table": "land_use_emissions_copy_test_matallo",
          "description": "",
          "x_axis": "date_processed",
          "series": [
            { "name": "Methane", "column": "methane_mmtco2e", "class": "line", "y_extent": [0,310], "strokeColor": "rgba(238,87,41,1)" },
            { "name": "Nitrous Oxide", "column": "nitrous_oxide_mmtco2e", "class": "line", "y_extent": [0,310], "strokeColor": "rgba(79,110,191,1)" }
          ]
        },
        {
          "name": "Land Use",
          "table": "land_use_emissions_copy_test_matallo_2",
          "description": "",
          "x_axis": "date_processed",
          "series": [
            { "name": "Land Use", "column": "land_use_million_hectares", "class": "line", "y_extent": [0,65], "strokeColor": "#F0542C" }
          ]
        }
      ]
    }
  ]
}
