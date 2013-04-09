ClimatePolicy::Application.routes.draw do

  with_options(only: :show) do |opts|
    opts.resources :regions do
      opts.resources :sectors # => subjects
      opts.resources :subjects # => sectors
    end

    opts.resources :sectors do
      opts.resources :subjects # => regions
      opts.resources :regions # => subjects
    end
  end

  root :to => redirect('/regions/brazil/subjects/emissions')
end
