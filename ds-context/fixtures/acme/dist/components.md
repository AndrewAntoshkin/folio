# Component API

### Button

Props: `variant`, `size`, `children`

Example:

```jsx
<Button variant="primary">Save</Button>
```

Avoid: A raw <button> with an inline background.

### Input

Props: `label`, `hint`, `error`

Example:

```jsx
<Input label="Email" />
```

Avoid: An unlabeled <input>.

### Dialog

Props: `open`, `title`, `onClose`

Example:

```jsx
<Dialog open title="Delete account" />
```

Avoid: A <div className="modal"> with a hand-rolled overlay.

### Select

Props: `label`, `options`, `value`

Example:

```jsx
<Select label="Country" options={countries} />
```

Avoid: A native <select> when the system Select exists.
