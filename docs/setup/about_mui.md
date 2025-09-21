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

But this is suboptimal solution. See [Avoid using Grid](#avoid-using-grid) for better solution.

# Avoid using Grid

It has broken behaviors, most notably when the component grids do not cover all columns.
I observed that if only 6 out of 12 of the default columns are occupied, very weird things happen,
like adding more horizontal text gradually expanding the width, or height being incorrectly calculated
to be too large if text wrapped once, but not if it wrapped 0 or twice.

Instead, use Stack, Box, and flexbox props.

For example, instead of:

``` typescript
<Grid container spacing={2}>
  {cardEntries.map((entry) => (
    <Grid size={6} key={`${entry.leadId}-${entry.displayMode}`}>
      <LeadCard leadId={entry.leadId} displayMode={entry.displayMode} />
    </Grid>
  ))}
</Grid>
```

use:

``` typescript
<Stack
  direction="row"
  spacing={2}
  sx={{
    flexWrap: 'wrap',
    '& > *': {
      flex: '0 0 calc(50% - 8px)', // 50% width minus half the spacing
    },
  }}
>
  {cardEntries.map((entry) => (
    <Box key={`${entry.leadId}-${entry.displayMode}`}>
      <LeadCard leadId={entry.leadId} displayMode={entry.displayMode} />
    </Box>
  ))}
</Stack>
```

The original version would have major layout issues in case of odd number of `cardEntries`.

# Transparent dialog actions / Wrong Dialog background color

Ultimately I have this problem because in `theme.tsx` I overrode `background: { paper: 'hsl(0, 0.00%, 16.10%)', }`.

- https://stackoverflow.com/questions/75310979/mui-dialog-background-color
  - from https://chatgpt.com/g/g-p-684e89e14dbc8191a947cc29c20ee528-game-ts/c/68b6b148-3ae4-8324-975b-c9e6db75f01a

# Color palettes

See OneNote `Color tools and palettes`.

# Padding of last child

``` typescript
// If I want less padding:
<CardContent sx={{ padding: 1, margin: 0, '&:last-child': { paddingBottom: 1 } }}>
```

# Remove the thin 1px ::before line before accordion elements

https://stackoverflow.com/questions/63488140/how-can-i-remove-line-above-the-accordion-of-material-ui

From Google AI when searching for `MUI accordion ::before`:

> The ::before pseudo-element in the context of a Material-UI (MUI) Accordion component typically refers to the styling
> that creates the thin line or divider that appears above each Accordion element. This line is part of the default
> styling for the MuiAccordion-root class. To modify or remove this line, you can target the ::before pseudo-element
> within the MuiAccordion-root class using CSS or styled-components.

[MUI MCP]: https://mui.com/material-ui/getting-started/mcp
[MUI MCP FAQ instructions]: https://mui.com/material-ui/getting-started/mcp/#ive-installed-the-mcp-but-it-is-not-being-used-when-i-ask-questions
[MCP inspector]: https://modelcontextprotocol.io/docs/tools/inspector
