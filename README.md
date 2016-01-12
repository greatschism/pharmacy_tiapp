##CARBON GUIDELINES

Run the following command from the project's root directory for more information.

```javascript
node ./tools/builder --help
```

### Do / Don'ts with builder:

#### Do:
1. Never delete a tss file always associated with your controller. Even through
if you are not using it or it is just empty. 

#### Don't:
1. Don't use 9patch images for splash screens until TIMOB-18908 issue is resolved.
2. Don't integrate TiCons with builder (It's useful only when the icons / splash screens has content only at the center - 1104 x 1104, leaves blank around. We are not sure whether all clients will meet this requirement).

TBC