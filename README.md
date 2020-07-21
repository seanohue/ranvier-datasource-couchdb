# ranvier-datasource-couchdb

> CouchDB DataSource for Ranvier

This bundle allows you to use a NoSQL [CouchDB](https://couchdb.apache.org/) database instead of flat files for your Ranvier game. Everything that loads from `JSON` and `YAML` files can be loaded via this DataSource, including area definitions for `Item`, `Room`, and `Npc`.

To use this bundle, you will need a specific checkout of Ranvier. You __MUST__ use my experimental fork ([azigler/zigmud](https://github.com/azigler/zigmud)) alongside a checkout of my experimental core:develop branch ([azigler/core:develop](https://github.com/azigler/core/tree/develop)).

This bundle __WILL NOT WORK__ with a [regular Ranvier checkout](https://github.com/RanvierMUD/ranviermud).

You will also need an [installation of CouchDB](https://docs.couchdb.org/en/stable/install/index.html) available with admin access and [dotenv](https://www.npmjs.com/package/dotenv) installed in the root of your Ranvier repository (`npm install --save dotenv`).

### Instructions

1. Install this bundle in your Ranvier repository.

2. Update (or create) the `.env` file in the root of your Ranvier repository and add `DB_UN='<couchdb-admin-username>'` and `DB_PW='<couchdb-admin-password>'` with your admin credentials for CouchDB.

3. Update `dataSources` in your `ranvier.json` to include the new `DataSource`:

```
"dataSources": {
    "CouchDb": {
      "require": "./bundles/ranvier-datasource-couchdb/CouchDbDataSource.js"
    }
  }
```

To use the `DataSource` as an `EntityLoader`, you'll need to set it with a `config` object for each type of data. You can include a `namespace` property if you want to potentially have different databases for each type (e.g., one for development and one for production). The `db` property represents the name of the database in your CouchDB instance. An example `config` for accounts looks like this:

```
"config": {
    "namespace": "dev_",
    "db": "account"
  }
```

This would attempt to utilize the `dev_account` database in your CouchDB instance.

4. Update `entityLoaders` in your `ranvier.json` to use your new `DataSource`. `QuestGoals` and `QuestRewards` are currently hard-coded to load from files currently, so this `DataSource` is untested for quests. Here's an example configuration using `ranvier-datasource-couchdb` for all data:
```
"entityLoaders": {
    "accounts": {
      "source": "CouchDb",
      "config": {
        "namespace": "dev_",
        "db": "account"
      }
    },
    "players": {
      "source": "CouchDb",
      "config": {
        "namespace": "dev_",
        "db": "player"
      }
    },
    "areas": {
      "source": "CouchDb",
      "config": {
        "namespace": "dev_",
        "db": "area"
      }
    },
    "npcs": {
      "source": "CouchDb",
      "config": {
        "namespace": "dev_",
        "db": "npc"
      }
    },
    "items": {
      "source": "CouchDb",
      "config": {
        "namespace": "dev_",
        "db": "item"
      }
    },
    "rooms": {
      "source": "CouchDb",
      "config": {
        "namespace": "dev_",
        "db": "room"
      }
    },
    "quests": {
      "source": "Yaml",
      "config": {
        "path": "bundles/[BUNDLE]/areas/[AREA]/quests.yml"
      }
    },
    "help": {
      "source": "CouchDb",
      "config": {
        "namespace": "dev_",
        "db": "help"
      }
    }
 ```
 
5. If you have pre-existing `YAML` files that you need to port over to the database, you can use a [YAML to JSON](https://www.convertjson.com/yaml-to-json.htm) service to hasten the process. `JSON` file contents can be copied into database documents easily or programmatically added.

### Usage

In the `item`, `room`, and `npc` databases, the document's `_id` is the area to which the entities belong. Within each document, it needs a property for the type of entity (`npc`, `room`, or `item`). The value of this property is an array of entity definitions of that type. For example, here is a document holding the `Items` for an `Area` called `debug`, pulling from the `dev_item` database:

```
{
  "_id": "debug",
  "_rev": "1-f034792b650d7a52cca28a63b380453f",
  "item": [
    {
      "id": "clothing-crate",
      "type": "CONTAINER",
      "name": "!crate! overflowing with clothing",
      "roomDesc": "!crate! is here, overflowing with clothing",
      "behaviors": {
        "dispenser": {
          "items": [
            "debug:bigshirt"
          ]
        }
      },
      "metadata": {
        "irretrievable": true,
        "commands": [
          "rummage"
        ]
      }
    }
  ]
}
```
`Helpfiles` each have their own document in the `help` database, with each document's `_id` representing the name of the helpfile. Similarly, `Accounts`, `Players`, and `Areas` are all represented as individual documents with `_id` properties representing the name of the `Account`, `Player`, or `Area`, respectively.

### Extending

You can use this `DataSource` to build a web-based editor for the document data. Otherwise, you can edit the values in the browser using Fauxton. If the database is running on your local machine, you can navigate to [http://127.0.0.1:5984/_utils](http://127.0.0.1:5984/_utils) and access your data after entering your admin credentials. You can also manipulate all of this data with [PouchDB](https://pouchdb.com/) in Node or in the browser, so this is a great starting point for using in-game data externally. Regardless, separating data from source keeps your data more readily available and your source more organized.