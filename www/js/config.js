angular.module('starter.config', [])
    .constant('DB_CONFIG', {
        name: 'splitspends',
        tables: [{
            name: 'grp',
            columns: [{
                name: 'grp_id',
                type: 'integer NOT NULL PRIMARY KEY AUTOINCREMENT'
            }, {
                name: 'grp_name',
                type: 'varchar(50) NOT NULL'
            }]
        }, {
            name: 'usr',
            columns: [{
                name: 'usr_id',
                type: 'integer NOT NULL PRIMARY KEY AUTOINCREMENT'
            }, {
                name: 'usr_name',
                type: 'varchar(50) NOT NULL'
            }]
        }, {
            name: 'grp_usr',
            columns: [{
                name: 'grp_id',
                type: 'integer NOT NULL'
            }, {
                name: 'usr_id',
                type: 'integer NOT NULL'
            }],
            foreignkeys: [{
                who: '(grp_id)',
                whom: 'grp (grp_id)'
            }, {
                who: '(usr_id)',
                whom: 'usr (usr_id)'
            }]
        }, {
            name: 'exp',
            columns: [{
                name: 'exp_id',
                type: 'integer NOT NULL PRIMARY KEY AUTOINCREMENT'
            }, {
                name: 'exp_name',
                type: 'varchar(50) NOT NULL'
            }, {
                name: 'exp_amt',
                type: 'integer NOT NULL'
            }, {
                name: 'exp_date',
                type: 'date'
            }, {
                name: 'exp_grp',
                type: 'integer NOT NULL'
            }],
            foreignkeys: [{
                who: '(exp_grp)',
                whom: 'grp (grp_id)'
            }]
        }, {
            name: 'paidby',
            columns: [{
                name: 'paid_id',
                type: 'integer NOT NULL PRIMARY KEY AUTOINCREMENT'
            }, {
                name: 'paid_usr',
                type: 'integer NOT NULL'
            }, {
                name: 'paid_amt',
                type: 'integer NOT NULL'
            }, {
                name: 'paid_exp',
                type: 'integer NOT NULL'
            }],
            foreignkeys: [{
                who: '(paid_exp)',
                whom: 'exp (exp_id)'
            }, {
                who: '(paid_usr)',
                whom: 'usr (usr_id)'
            }]
        }, {
            name: 'applicableto',
            columns: [{
                name: 'applicable_id',
                type: 'integer NOT NULL PRIMARY KEY AUTOINCREMENT'
            }, {
                name: 'applicable_usr',
                type: 'integer NOT NULL'
            }, {
                name: 'applicable_amt',
                type: 'integer NOT NULL'
            }, {
                name: 'applicable_exp',
                type: 'integer NOT NULL'
            }],
            foreignkeys: [{
                who: '(applicable_exp)',
                whom: 'exp (exp_id)'
            }, {
                who: '(applicable_usr)',
                whom: 'usr (usr_id)'
            }]
        }, {
            name: 'settlements',
            columns: [{
                name: 'settlement_id',
                type: 'integer NOT NULL PRIMARY KEY AUTOINCREMENT'
            }, {
                name: 'settlement_from_usr',
                type: 'integer NOT NULL'
            }, {
                name: 'settlement_to_usr',
                type: 'integer NOT NULL'
            }, {
                name: 'settlement_amt',
                type: 'integer NOT NULL'
            }, {
                name: 'settlement_grp',
                type: 'integer NOT NULL'
            }],
            foreignkeys: [{
                who: '(settlement_from_usr)',
                whom: 'usr (usr_id)'
            }, {
                who: '(settlement_to_usr)',
                whom: 'usr (usr_id)'
            }, {
                who: '(settlement_grp)',
                whom: 'grp (grp_id)'
            }]
        }]
    });