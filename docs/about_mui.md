# About MUI (Material-UI)

# Initial MUI setup

```powershell
cd web

# Material UI - basics
# https://mui.com/material-ui/getting-started/installation/
npm install @mui/material @emotion/react @emotion/styled
npm install @fontsource/roboto
npm install @mui/icons-material

# MUI X Data Grid
# https://mui.com/x/react-data-grid/quickstart/#installation
npm install @mui/x-data-grid

# MUI X Charts
# https://mui.com/x/react-charts/quickstart/#installation
npm install @mui/x-charts
```

## Setup MUI MCP server

Configure the server per [MUI MCP].

This resulted in following in `.vscode/mcp.json`:

```json
{
    "servers": {
        "mui-mcp": {
            "type": "stdio",
            "command": "npx",
            "args": ["-y", "@mui/mcp@latest"],
            "cwd": "${input:cwd}",
            "dev": {}
        }
    },
    "inputs": [
        {
            "id": "cwd",
            "type": "promptString",
            "description": "Working Directory"
        }
    ]
}
```

And also in `.github/instructions/mui.instructions.md` with the contents [from the FAQ][MUI MCP FAQ instructions].

Note: [the docs][MUI MCP] also mention how to test the MCP server with [MCP inspector]:

``` powershell
npx @modelcontextprotocol/inspector npx -y @mui/mcp@latest
```

And then [per this FAQ](https://mui.com/material-ui/getting-started/mcp/#ive-installed-the-mcp-but-there-are-errors-in-connection),
in the inspector page, set the `Command` to `npx`, `Args` to `-y @mui/mcp@latest`, and then click `Connect`.

# What sets the `<html>` element background

`<CssBaseline>` sets it to `theme.palette.background.default` per:
https://mui.com/material-ui/react-css-baseline/

# Selection model confusion

https://mui.com/x/migration/migration-data-grid-v7/#selection
https://mui.com/x/react-data-grid/row-selection/#controlled-row-selection
https://mui.com/x/react-data-grid/row-selection/#apiref

# Theme dark mode confusion

There appear to be two separate dark modes!

First:
`<ThemeProvider theme={theme} defaultMode="dark">`
`<ThemeProvider theme={theme} defaultMode="light">`

Second, secret one, by forcing palette to be dark:
https://mui.com/material-ui/customization/dark-mode/#dark-mode-only

``` typescript
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});
```

The second secret one actually changes the button styling to the one as shown to be dark in the default theme viewer:
https://mui.com/material-ui/customization/default-theme/

I think the weird secret behavior is explained by this:

> Setting the dark mode this way only works if you are using the default palette. If you have a custom palette,
> make sure that you have the correct values based on the mode. The next section explains how to do this.

From the same page.

# Forcing line break in Alert

Per:
https://mui.com/material-ui/react-alert/

> The Alert component wraps around its content, and stretches to fill its enclosing container.

This can be solved in wrapping the text in `<Box>` e.g.:

```typescript
<Collapse in={showAlert}>
  <Alert severity="error" onClose={() => setShowAlert(false)}>
    <Box
      sx={{
        minWidth: 0,
        maxWidth: '100%',
        wordBreak: 'break-word',
        whiteSpace: 'normal',
        overflowWrap: 'break-word',
      }}
    >
      This action can be done only on available agents!
    </Box>
  </Alert>
</Collapse>
```

# Unexpected MUI Grid width expansion upon component wrap

https://chatgpt.com/c/687f3164-f170-8011-94a5-5e95acd3ccfa

E.g. when I have:

``` typescript
<Grid container>
  <Grid size={6}>card1</Grid>
  <Grid size={6}>card2</Grid>
</Grid>
```

then this works but then if I add

``` typescript
<Grid container>
  <Grid size={6}>card1</Grid>
  <Grid size={6}>card2</Grid>
  <Grid size={6}>card3</Grid>
</Grid>
```

or more, then the total width by size is 18 which is more than allowed 12, which is likely the culprit.

To circumvent the problem, render in pairs:

``` typescript
<Grid container>
  <Grid container>
    <Grid size={6}>card1</Grid>
    <Grid size={6}>card2</Grid>
  </Grid>
  <Grid container>
    <Grid size={6}>card3</Grid>
    <Grid size={6}>card4</Grid>
  </Grid>
</Grid>
```

# Color palettes

- https://m2.material.io/design/color/the-color-system.html#tools-for-picking-colors
- https://bareynol.github.io/mui-theme-creator/
- https://colors.artyclick.com/color-names-dictionary/
  e.g. https://colors.artyclick.com/color-shades-finder/?color=#404040
- https://meyerweb.com/eric/tools/color-blend
- https://m2.material.io/inline-tools/color/

[MUI MCP]: https://mui.com/material-ui/getting-started/mcp
[MUI MCP FAQ instructions]: https://mui.com/material-ui/getting-started/mcp/#ive-installed-the-mcp-but-it-is-not-being-used-when-i-ask-questions
[MCP inspector]: https://modelcontextprotocol.io/docs/tools/inspector
