#  Terraform Dependency Finder
Do you want to find out the best order to deploy your terraform modules?
Are you worried about having circular dependencies between your terraform modules?
Then this is the action for you!



## Inputs

### `path-to-terraform`

**Required** Path to folder including all the terraform modules.

### `modules-ignore`

**Required** Space separated terraform modules names to be excluded from the results. ex. "module1 module2". Default `''`.

## Outputs

### all-modules

A list of a sequential order of how you can deploy your modules.

#### Example

```
[c, b, a]
```

### dependency-chart
An object with the module as the key and modules it depends on as value.

#### Example

```
{
    "a" : ["b","c"],
    "b" : ["d"],
    "c" : ["d"]
    "d" : []
}
```

### run-order

A list of lists where each list element sequentially describes modules that can be run in parallel.

#### Example
```
[
    [d],
    [c,b],
    [a]
]
```

## Example usage
```
- uses: ./terraform-dep
  id: tf
  with:
    path-to-terraform: './terraform'
    modules-ignore: ''
- name: Get the output
  run: |
    echo "${{ steps.tf.outputs.all-modules }}"
    echo "${{ steps.tf.outputs.dependency-chart }}"
    echo "${{ steps.tf.outputs.run-order }}"
```
