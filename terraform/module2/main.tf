data "terraform_remote_state" "module3" {
  backend = "gcs"

  config = {
    bucket = var.project
    prefix = join("/", compact(["terraform-state", "module3", var.seed]))
  }
}
