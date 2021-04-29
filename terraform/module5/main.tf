data "terraform_remote_state" "module2" {
  backend = "gcs"

  config = {
    bucket = var.project
    prefix = join("/", compact(["terraform-state", "module2", var.seed]))
  }
}
