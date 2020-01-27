# Starbucks calories 

First, download store's menu:

```
https://www.starbucks.com/bff/ordering/menu?storeNumber=2983
```

Parse menu and download all products:

```
node download.js
```

Finally build the calories tables for all drinks:

```
node merge.js
```
