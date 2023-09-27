# Idbr
Idbr is a wrapper that treats IndexedDB like an RDB.
A web interface "IdbrAdmin", and a sample database "world" are also included.

## deleteObjectStore
### Parameters
name
: Object store name

## createObjectStore
### Parameters
name
: Object store name

options
: Options

## deleteDatabase
### Parameters
name
: Database name

## createDatabase
### Parameters
name
: Database name

version
: Version of database

onupgradeneeded
: onupgradeneeded callback function

## insert
### Parameters

into
: Object store name

rows
: Array of row data

## select
### Parameters
select
: Callback function equivalent to select clause

from
: Object store name

join
: Array of object store names to natural join

where
: Callback function equivalent to where clause

groupBy
: Column name used for grouping

aggregate
: Aggregate functions used for grouping. The following are provided as static methods of Idbr:sum, min, max, count, avr

having
: Callback function equivalent to having clause

orderBy
: Callback function equivalent to orderBy clause

limit
: Array equivalent to limit clause

## update
### Parameters
update
: Object store name

set
: Callback function equivalent to set clause

where
: Callback function equivalent to where clause

## delete
### Parameters
from
: Object store name

where
: Callback function equivalent to where clause
