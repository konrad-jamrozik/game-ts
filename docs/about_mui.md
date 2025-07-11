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

[MUI MCP]: https://mui.com/material-ui/getting-started/mcp
[MUI MCP FAQ instructions]: https://mui.com/material-ui/getting-started/mcp/#ive-installed-the-mcp-but-it-is-not-being-used-when-i-ask-questions
[MCP inspector]: https://modelcontextprotocol.io/docs/tools/inspector
