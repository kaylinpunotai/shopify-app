# frozen_string_literal: true

class HomeController < ApplicationController
  include ShopifyApp::EmbeddedApp
  include ShopifyApp::RequireKnownShop
  include ShopifyApp::ShopAccessScopesVerification

  DEV_INDEX_PATH = Rails.root.join("frontend")
  # PROD_INDEX_PATH = Rails.public_path.join("dist")
  PROD_INDEX_PATH = "/app/frontend/dist"

  def index
    puts PROD_INDEX_PATH
    puts DEV_INDEX_PATH

    contents = File.read(File.join(Rails.env.production? ? PROD_INDEX_PATH : DEV_INDEX_PATH, "index.html"))

    render(plain: contents, content_type: "text/html", layout: false)
  end
end
