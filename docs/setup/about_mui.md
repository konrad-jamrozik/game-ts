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

# MUI TreeView
# https://mui.com/x/react-tree-view/quickstart/
npm install @mui/x-tree-view
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
      flex: '0 0 calc(50%)', // 50% width
    },
  }}
>
  {cardEntries.map((entry) => (
    <Box key={`${entry.leadId}-${entry.displayMode}`} sx={{ padding: 1 }}>
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

MUI color utils:

- https://github.com/mui/material-ui/blob/master/packages/mui-material/src/styles/index.d.ts#L52-L67
  - Linked from https://mui.com/material-ui/customization/palette/

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

But better yet: use `<Card>` with `<Collapse>` instead of `<Accordion>`.

[MUI MCP]: https://mui.com/material-ui/getting-started/mcp
[MUI MCP FAQ instructions]: https://mui.com/material-ui/getting-started/mcp/#ive-installed-the-mcp-but-it-is-not-being-used-when-i-ask-questions
[MCP inspector]: https://modelcontextprotocol.io/docs/tools/inspector

# children prop in custom label in custom TreeView

This MUI doc shows how to customize the label in a custom TreeView:

- https://mui.com/x/react-tree-view/tree-item-customization/#label

Specifically this source code:

- https://github.com/mui/mui-x/blob/v8.17.0/docs/data/tree-view/tree-item-customization/LabelSlot.tsx
- https://github.com/mui/mui-x/blob/2423e2fd491c837ce5d30fbf6c34913c15ac2cb9/docs/data/tree-view/tree-item-customization/LabelSlot.tsx

In the example, [this line][L100] (see line marked with `HERE ->`):
``` typescript
const CustomTreeItem = React.forwardRef(function CustomTreeItem(
  props: TreeItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const item = useTreeItemModel<TreeItemWithLabel>(props.itemId)!;

  return (
    <TreeItem
      {...props}
      ref={ref}
      slots={{
        label: CustomLabel,
      }}
      slotProps={{
HERE -> label: { secondaryLabel: item?.secondaryLabel || '' } as CustomLabelProps,
      }}
    />
  );
});
```

Shows this problem:

`Unsafe type assertion: type 'CustomLabelProps' is more narrow than the original type.eslint@typescript-eslint/no-unsafe-type-assertion`

[L100]: https://github.com/mui/mui-x/blob/2423e2fd491c837ce5d30fbf6c34913c15ac2cb9/docs/data/tree-view/tree-item-customization/LabelSlot.tsx#L100

You can fix it by:
- Adding `children: item.label` and `className: props.className` to the props.
- Ensuring that `CustomLabelProps` type defines the `className` as `string | undefined` instead of just `string`.
  - Alternatively, you can delete `className` from everywhere altogether. It is unused in the example anyway.
- Optionally, you can also use newer syntax for `React.forwardRef` and get rid of it.
- Optionally, also modernize the nullish checks in `secondaryLabel` value.

Altogether, the fixed code looks like this:

``` typescript
type CustomLabelProps = {
  children: string // Note: this must be called 'children' for MUI TreeItem to work.
  className: string | undefined // Or delete this altogether, and all references to it.
  secondaryLabel: string
}

(...)
function CustomTreeItem({ ref, ...props }: CustomTreeItemProps): React.ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const item = useTreeItemModel<TreeItemWithLabel>(props.itemId)!

  const customLabelProps: CustomLabelProps = {
    children: item.label,
    secondaryLabel: (item.secondaryLabel ?? '') || '',
  }
  const treeItemSlotProps: TreeItemSlotProps = {
    label: customLabelProps,
  }
  return (
    <TreeItem
      {...props}
      ref={ref}
      slots={{
        label: CustomLabel,
      }}
      slotProps={treeItemSlotProps}
    />
  )
}

```

So what is going on here?

First, observe that if you would define `customLabelProps: CustomLabelProps` without `children` property,
you would get a type error of:
`Property 'children' is missing in type '{ secondaryLabel: string; }' but required in type 'CustomLabelProps'.ts(2741)`.

You could delete `children` from the `CustomLabelProps` type definition, but then this code:

``` typescript
slotProps={{
  label: customLabelProps,
}}
```

will give you following error:

`Type 'CustomLabelProps' is not assignable to type 'SlotComponentProps<"div", {}, {}> | undefined'`

This is because `CustomLabelProps` are passed as props to `CustomLabel` via the slot mechanism:

``` typescript
slots={{
  label: CustomLabel,
}}
slotProps={treeItemSlotProps}
```

The `TreeItemSlotProps` expects a `label` property of type `SlotComponentProps<'div', {}, {}>`.

`SlotComponentProps` is defined in:
`node_modules\@mui\utils\esm\types\index.d.ts`

as

``` typescript
export type SlotComponentProps<TSlotComponent extends React.ElementType, TOverrides, TOwnerState> = (Partial<React.ComponentPropsWithRef<TSlotComponent>> & TOverrides) | ((ownerState: TOwnerState) => Partial<React.ComponentPropsWithRef<TSlotComponent>> & TOverrides);
```

So in our case it is:

``` typescript
type SlotComponentProps<'div', {}, {}> = (Partial<React.ComponentPropsWithRef<'div'>> & {}) | ((ownerState: {}) => Partial<React.ComponentPropsWithRef<'div'>> & {})
// Here, React.ComponentPropsWithRef<'div'>> evaluates to:
ComponentProps<T> // <T extends ElementType> and T is 'div'
// And ComponentProps<T> evaluates to:
JSX.IntrinsicElements['div'] // T == 'div'
// And JSX.IntrinsicElements['div'] is per node_modules\@types\react\index.d.ts
div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
// Which eventually evaluates to:
interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> { /* ... */ }
// Where:
    interface DOMAttributes<T> {
        children?: ReactNode | undefined;
        // ...
    }
```

Which means there has to be at least one property that is both in  `CustomLabelProps` and `JSX.IntrinsicElements['div']`.
It can be `children`, but technically speaking it can be also something else and it will work in this specific case.

You can confirm this by doing e.g.:

``` typescript
const props1 = { secondaryLabel: "foo" }
const props2 = { children: "foo" }
const props3 = { content: "foo" }

// ERROR: Type '{ secondaryLabel: string; }' has no properties in common with type 'DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
const treeItemSlotProps1: React.JSX.IntrinsicElements['div'] = props1

// OK! - because the common property with JSX.IntrinsicElements['div'] is 'children'
const treeItemSlotProps2: React.JSX.IntrinsicElements['div'] = props2

// OK! - because the common property with JSX.IntrinsicElements['div'] is 'content'
const treeItemSlotProps3: React.JSX.IntrinsicElements['div'] = props3
```

or even you can do this:

``` typescript
type CustomLabelProps = {
  content: string // Renamed `children` to `content`
  secondaryLabel: string
}
// And also replace all references to `children` with `content` in the code.
```

and it will work, but you should actually use `children`, not `content`.
`children` semantically represents the content between opening and closing JSX tags.

Basically the typing mechanism assumes the `label` slot will have a component compatible with the `div` element
semantics, even though the `CustomLabel` is not simply `<div>{children}</div>` but:

``` typescript
function CustomLabel({ children, secondaryLabel }: CustomLabelProps): React.ReactElement {
  return (
    <div>
      <Typography>{children}</Typography>
      {secondaryLabel && (
        <Typography variant="caption" color="secondary">
          {secondaryLabel}
        </Typography>
      )}
    </div>
  )
}
```

Note you could also change the definitions like that:

``` typescript
// PREVIOUS
type CustomLabelProps = {
  children: string
  secondaryLabel: string
}
// ==========>>
// CHANGED
type CustomLabelProps = React.ComponentPropsWithoutRef<'div'> & {
  secondaryLabel: string
}
```

If you do it like that, you no longer have to pass `children` to the `CustomLabel` component, because it is already
passed by MUI, presumably via the slot mechanism in the `TreeItem` component:

``` typescript
const customLabelProps: CustomLabelProps = {
  // children: item.label, // Removed, passed implicitly by MUI. Triggered with React.ComponentPropsWithoutRef<'div'> in CustomLabelProps type definition.
  secondaryLabel: (item.secondaryLabel ?? '') || '',
}
```

If you would rename the `item.label` e.g. to `item.label2`:

``` typescript
type TreeItemWithLabel = {
  id: string
  label2: string // Renamed from `label`, breaks MUI TreeView.
  secondaryLabel?: string
}
```

then the app will fail at runtime with following MUI error:

``` text
Error: MUI X: The Tree View component requires all items to have a `label` property.
Alternatively, you can use the `getItemLabel` prop to specify a custom label for each item.
An item was provided without label in the `items` prop:
```

You can actually find it defined in `web\node_modules\@mui\x-tree-view\esm\models\items.d.ts`

``` typescript
export type TreeViewDefaultItemModelProperties = {
  id: string;
  label: string;
};
export type TreeViewBaseItem<R extends {} = TreeViewDefaultItemModelProperties> = R & {
  children?: TreeViewBaseItem<R>[];
};
```

See also:
- https://mui.com/x/common-concepts/custom-components/
