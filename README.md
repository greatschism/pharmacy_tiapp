Run the following command from the project's 
root directory for more information.

node ./tools/builder --help

Do / Don'ts with builder:
-------------------------

Do:
---
1. Never delete a tss file always associated with your controller. Even through
if you are not using it or it is just empty. 

Done't:
-------
1. Don't use 9patch images for splash screens until TIMOB-18908 issue is resolved.
2. Don't integrate TiCons with builder (It's useful only when the splash screens 
has content only at the center, leaves blank around. We are not sure whether all clients
will meet this requirement).