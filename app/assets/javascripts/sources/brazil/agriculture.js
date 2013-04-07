var datasets = {
  "sectors": [
    { "name": "agriculture",
      "subjects": [
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
            {"name": "Land Use", "column": "land_use_million_hectares", "class": "line", "y_extent": [0,65], "strokeColor": "#F0542C"}
          ]
        },
        {
          "name": "Intensity indices",
          "table": "emissions_drivers_copy_test_matallo",
          "description": "",
          "x_axis": "date_processed",
          "series": [
            { "name": "Food Production per Hectare", "column": "food_production_per_hectare", "class": "line", "y_extent": [0,280], "strokeColor": "#546DBC" },
            { "name": "Livestock Production per Hectare", "column": "livestock_production_per_hectare", "class": "line", "y_extent": [0,280], "strokeColor": "#F0542C" },
            { "name": "Non-Food Production per Hectare", "column": "non_food_production_per_hectare", "class": "line", "y_extent": [0,280], "strokeColor": "#00D9A3" },
            { "name": "Tractor Usage per Hectare", "column": "tractor_usage_per_hectare", "class": "line", "y_extent": [0,280], "strokeColor": "#FFD24D" }
          ]
        },
        {
          "name": "Exports",
          "table": "brazil_ag_2_exports_copy_test_matallo",
          "description": "",
          "x_axis": "date_processed",
          "series": [
            {"name": "Agricultural Raw Materials", "column": "agricultural_raw_materials", "class": "line", "y_extent": [0,55], "strokeColor": "#546DBC"},
            {"name": "Food", "column": "food", "class": "line", "y_extent": [0,55], "strokeColor": "#F0542C"}
          ]
        },
        {
          "name": "Credit",
          "table": "brazil_ag_3_credit_subsidies_copy_test_matallo",
          "description": "",
          "x_axis": "date_processed",
          "series": [
            {"name": "Credit Subsidies", "column": "credit_subsidies", "class": "line", "y_extent": [-4800,17400], "strokeColor": "#546DBC"},
            {"name": "Non-Credit Subsidies", "column": "non_credit_producer_subsidies", "class": "line", "y_extent": [-4800,17400], "strokeColor": "#F0542C"},
            {"name": "Total Subsidies to Producers", "column": "total_producer_support", "class": "line", "y_extent": [-4800,17400], "strokeColor": "#00D9A3"}
          ]
        }
      ]
    }
  ]
}
