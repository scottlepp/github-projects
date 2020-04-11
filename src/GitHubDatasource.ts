import _ from 'lodash';
import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  DataSourceJsonData,
  MutableDataFrame,
  DataFrame,
  guessFieldTypeFromValue,
  FieldType,
} from '@grafana/data';

import projects from '../data/projects-clean.json';

import { SqlQuery } from './types';
// import { getBackendSrv } from '@grafana/runtime';
// import alasql from 'alasql';
import { execute, loaded } from './sql';

export class DataSource extends DataSourceApi<SqlQuery, DataSourceJsonData> {
  /** @ngInject */
  constructor(instanceSettings: DataSourceInstanceSettings<DataSourceJsonData>, public templateSrv: any) {
    super(instanceSettings);
  }

  async query(options: DataQueryRequest<SqlQuery>): Promise<DataQueryResponse> {
    const { range } = options;

    if (!range) {
      return { data: [] };
    }
    options.startTime = range.from.valueOf();
    options.endTime = range.to.valueOf();

    // const baseUrl = this.instanceSettings.url!
    // const route = baseUrl.endsWith('/') ? 'query?' : '/query?';

    const opts = this.interpolate(options);

    await loaded();

    const calls = opts.targets.map(target => {
      // const url = `${baseUrl}${route}sql=${target.sql}`;
      // return getBackendSrv().datasourceRequest({ url }).then(res => {
      //   return this.arrayToDataFrame(res.data);
      // });
      let list: any = projects;
      if (target.sql) {
        if (target.sql.toLowerCase().startsWith("select")) {
          list = execute(target.sql, projects);
        } else {
          const sql = JSON.parse(target.sql);
          if (sql.filters) {
            list = list.filter(item => {
              let match = false;
              for (const filter of sql.filters) {
                for (const key in filter) {
                  match = item[key] === filter[key];
                }
              }
              return match;
            });
          }
          if (sql.fields) {
            list = list.map(item => {
              const ret = {};
              for (const field of sql.fields) {
                ret[field] = item[field];
              }
              return ret;
            })
          }
        }
      }
      const frame = this.arrayToDataFrame(list);
      return Promise.resolve(frame);
    });

    const data = await Promise.all(calls);

    return {
      data,
    };
  }

  arrayToDataFrame(array: any[]): DataFrame {
    let dataFrame: MutableDataFrame = new MutableDataFrame();
    if (array.length > 0) {
      const fields = Object.keys(array[0]).map(field => {
        let type = guessFieldTypeFromValue(array[0][field]);
        if (["created_at", "started", "card_created", "card_updated"].includes(field)) {
          type = FieldType.time;
        }
        return { name: field, type};
      });
      dataFrame = new MutableDataFrame({fields})
      array.forEach((row, index) => {

        row.created_at = this.stringDateToMillis(row.created_at);
        row.started = this.stringDateToMillis(row.started);
        row.card_created = this.stringDateToMillis(row.card_created);
        row.card_updated = this.stringDateToMillis(row.card_updated);

        dataFrame.appendRow(Object.values(row));
        // dataFrame.add(row, true)
      });
      // for (const field of dataFrame.fields) {
      //   if (["created_at", "started", "card_created", "card_updated"].includes(field.name)) {
      //     field.type = FieldType.time;
      //     // TODO - iterate over values and convert from string to number
      //     field.values = 
      //   }
      // }
    }
    return dataFrame;
  }

  stringDateToMillis(value) {
    if (value !== undefined) {
      return Date.parse(value);
    }
    return value;
  }

  interpolate(options: DataQueryRequest<SqlQuery>): DataQueryRequest<SqlQuery> {
    const visibleTargets: SqlQuery[] = options.targets.filter((target: SqlQuery) => !target.hide);
    return {
      ...options,
      targets: visibleTargets.map(target => {
        const query: SqlQuery = {
          ...target,
          sql: this.templateSrv.replace(target.sql),
        };
        return query;
      }),
    };
  }

  metricFindQuery(query: any) {
    console.log('query', query);
    return Promise.resolve([]);
  }

  async testDatasource() {
    // const url = this.instanceSettings.url!;
    // const response = await getBackendSrv().post(url, this.instanceSettings.jsonData);
    return {
      status: 'success',
      // message: response.data,
      title: 'Success',
    };
  }
}
