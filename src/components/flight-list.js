import React from 'react'
import { Table } from 'antd'
import axios from 'axios'

const columns = [{
  title: '航班号',
  dataIndex: 'flightNo'
}, {
  title: '起飞时间',
  dataIndex: 'departureTime',
  defaultSortOrder: 'ascend',
  sorter: (a, b) => {
    let aTime = a.departureTime.split(':'),
      bTime = b.departureTime.split(':'),
      _a = parseInt(aTime[0])*60+ parseInt(aTime[1]),
      _b = parseInt(bTime[0])*60+ parseInt(bTime[1])
    return _a - _b
  },
}, {
  title: '降落时间',
  dataIndex: 'arrivalTime',
  sorter: (a, b) => {
    let aTime = a.departureTime.split(':'),
      bTime = b.departureTime.split(':'),
      _a = parseInt(aTime[0])*60+ parseInt(aTime[1]),
      _b = parseInt(bTime[0])*60+ parseInt(bTime[1])
    return _a - _b
  },
},{
  title: '机票价格',
  dataIndex: 'price',
  sorter: (a, b) => parseInt(a.price) - parseInt(b.price),
},{
  title: '折扣',
  dataIndex: 'discount'
}];

export default class FlightList extends React.Component{
  constructor() {
    super()
    this.state = {
      list: []
    }
  }
  componentWillMount() {
    this.getData()
  }
  getData() {
    axios.get('./mock-flights.json').then(res=>{
      let data = res.data
      console.log('data>>',data)
      data.data.map((item,index)=> {item.key = index})
      this.setState({
        list: data.data
      })
    })
  }
  onChange(pagination, filters, sorter) {
    console.log('params', pagination, filters, sorter);
  }

  render() {
    return (
      <div>
        <Table columns={columns} dataSource={this.state.list} onChange={this.onChange}></Table>
      </div>
    )
  }
}
