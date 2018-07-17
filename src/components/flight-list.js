import React from 'react'
import { Table, Popconfirm } from 'antd'
import axios from 'axios'

export default class FlightList extends React.Component {
  constructor() {
    super()
    this.state = {
      list: [],
      flightDesc: '',
      sysTime: Date.now()
    }
    this.columns = [{
      title: '航班号',
      dataIndex: 'flightNo'
    }, {
      title: '起飞时间',
      dataIndex: 'departureTime',
      defaultSortOrder: 'ascend',
      sorter: (a, b) => {
        let aTime = a.departureTime.split(':'),
          bTime = b.departureTime.split(':'),
          _a = parseInt(aTime[0]) * 60 + parseInt(aTime[1]),
          _b = parseInt(bTime[0]) * 60 + parseInt(bTime[1])
        return _a - _b
      },
    }, {
      title: '降落时间',
      dataIndex: 'arrivalTime',
      sorter: (a, b) => {
        let aTime = a.departureTime.split(':'),
          bTime = b.departureTime.split(':'),
          _a = parseInt(aTime[0]) * 60 + parseInt(aTime[1]),
          _b = parseInt(bTime[0]) * 60 + parseInt(bTime[1])
        return _a - _b
      },
    }, {
      title: '机票价格',
      dataIndex: 'price',
      sorter: (a, b) => parseInt(a.price) - parseInt(b.price),
    }, {
      title: '折扣',
      dataIndex: 'discount'
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (text, record) => {
        return (
          this.state.list.length > 1
            ? (
              <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.id)}>
                <a href="javascript:;" style={{ 'color': 'red' }}>Delete</a>
              </Popconfirm>
            ) : null
        );
      },
    }]
  }
  tickTok() {
    this.setState(prevState => ({
      sysTime: prevState.sysTime += 1000
    }))
  }
  componentWillMount() {
    this.getData()
  }
  componentDidMount() {
    this.timer = setInterval(() => this.tickTok(), 1000)
  }
  componentWillUnmount() {
    clearInterval(this.timer)
  }
  getData() {
    axios.get('http://localhost:1234/flights').then(res => {
      let data = res.data.data
      console.log('data>>', data)
      // 添加唯一key
      data.data.map((item, index) => { item.key = item.id })
      this.setState({
        list: data.data,
        flightDesc: data.desc
      })
    })
  }
  onChange(pagination, filters, sorter) {
    console.log('params', pagination, filters, sorter);
  }

  handleDelete = (id) => {
    console.log('delete id>>>', id)
    const list = [...this.state.list]
    this.setState({ list: list.filter(item => item.id !== id) })
    axios.get('http://localhost:1234/flights/delete', { params: { id } }).then(res => {
      console.log(res.msg)
    })
  }

  render() {
    return (
      <div>
        <p className="App-intro" onClick={() => this.setState({ flightDesc: 'Missing..' })}>{this.state.flightDesc}</p>
        {/* <p>{this.state.sysTime}</p> */}
        {/* <p>{this.props.tot}</p> */}

        <Table columns={this.columns} dataSource={this.state.list} onChange={this.onChange}></Table>
      </div>
    )
  }
}
