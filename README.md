# detected-changes-action

This action generates a build matrix dynamically based on where files are changed in the diff from the default branch. 

## Inputs

### `repo-token`

The Github token used to authenticate. 

### `target-directory`

An optional directory to listen to changes under. 

### `depth`

How many levels deep to search for changes. 

## Outputs

### `build_matrix`

The generated build matrix.

### `is_empty`

Returns true if the build matrix is empty. 

## Example usage

```yaml
name: Generate build matrix
runs-on: ubuntu-latest
outputs:
  build_matrix: ${{ steps.generate_build_matrix.outputs.build_matrix }}
  is_empty: ${{ steps.generate_build_matrix.outputs.is_empty }}
steps:
  - name: Checkout
    uses: actions/checkout@v2
  - name: Generate build matrix
    uses: keiththompson/detected-changes-action@x.x.x
    id: generate_build_matrix
    with:
      repo-token: ${{ secrets.GITHUB_TOKEN }}
      target-directory: projects
      depth: 3
```

### Downstream workflow

```yaml
Build:
    needs: generate-matrix
    runs-on: ubuntu-latest
    strategy:
      matrix: ${{fromJson(needs.generate-matrix.outputs.build_matrix)}}
```
