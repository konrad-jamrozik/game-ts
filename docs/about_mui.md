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

[MUI MCP]: https://mui.com/material-ui/getting-started/mcp
[MUI MCP FAQ instructions]: https://mui.com/material-ui/getting-started/mcp/#ive-installed-the-mcp-but-it-is-not-being-used-when-i-ask-questions
[MCP inspector]: https://modelcontextprotocol.io/docs/tools/inspector
