ClimatePolicy::Application.routes.draw do

  with_options(only: :show) do |opts|
    opts.resources :regions do
      opts.resources :sectors
      opts.resources :subjects
    end

    opts.resources :sectors do
      opts.resources :subjects
      opts.resources :regions
    end
  end

  root :to => redirect('/regions/brazil/subjects/emissions')
end
