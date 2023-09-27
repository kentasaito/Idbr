# Idbr
IdbrはIndexedDBをRDBのように扱うラッパーです。
Webインターフェース"IdbrAdmin"とサンプルデータベース"world"も同梱しています。

## deleteObjectStore
### 引数
name
: オブジェクトストア名

## createObjectStore
### 引数
name
: オブジェクトストア名

options
: オプション

## deleteDatabase
### 引数
name
: データベース名

## createDatabase
### 引数
name
: データベース名

version
: データベースのバージョン

onupgradeneeded
: onupgradeneededコールバック関数

## insert
### 引数

into
: オブジェクトストア名

rows
: 行データの配列

## select
### 引数
select
: select句に相当するコールバック関数

from
: オブジェクトストア名

join
: 自然結合するオブジェクトストア名の配列

where
: where句に相当するコールバック関数

groupBy
: グルーピングに使用するカラム名

aggregate
: グルーピングに使用する集計関数。以下はIdbrのスタティックメソッドとして提供:sum, min, max, count, avr

having
: having句に相当するコールバック関数

orderBy
: orderBy句に相当するコールバック関数

limit
: limit句に相当する配列

## update
### 引数
update
: オブジェクトストア名

set
: set句に相当するコールバック関数

where
: where句に相当するコールバック関数

## delete
### 引数
from
: オブジェクトストア名

where
: where句に相当するコールバック関数
