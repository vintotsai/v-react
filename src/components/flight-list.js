import React from 'react'
import { Table, Popconfirm, Button, Modal, Form, Input, Icon } from 'antd'
import axios from 'axios'
import ReactEcharts from 'echarts-for-react'

const FormItem = Form.Item
const Search = Input.Search

const FlightCreateForm = Form.create()(
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, onEdit, form, currentFlt } = this.props
      const { getFieldDecorator } = form
      console.log('currentFlt>>', currentFlt)
      return (
        <Modal
          visible={visible}
          title={currentFlt ? "编辑航班信息" : '新建航班信息'}
          okText={currentFlt ? "确定" : '新建'}
          cancelText="取消"
          onCancel={onCancel}
          onOk={currentFlt ? onEdit : onCreate}
        >
          <Form layout="vertical">
            <FormItem label="航班号">
              {getFieldDecorator('flightNo', {
                rules: [{ required: true, message: '请输入航班号!' }],
                initialValue: currentFlt ? currentFlt.flightNo : undefined,
              })(
                <Input placeholder="深圳航空ZH9112" />
              )}
            </FormItem>
            <FormItem label="起飞时间">
              {getFieldDecorator('departureTime', {
                rules: [{ required: true, message: '请输入起飞时间!' }],
                initialValue: currentFlt ? currentFlt.departureTime : undefined,
              })(
                <Input placeholder="00:00" />
              )}
            </FormItem>
            <FormItem label="降落时间">
              {getFieldDecorator('arrivalTime', {
                rules: [{ required: true, message: '请输入降落时间!' }],
                initialValue: currentFlt ? currentFlt.arrivalTime : undefined,
              })(
                <Input placeholder="00:00" />
              )}
            </FormItem>
            <FormItem label="机票价格">
              {getFieldDecorator('price', {
                rules: [{ required: true, message: '请输入价格!' }],
                initialValue: currentFlt ? currentFlt.price : undefined,
              })(
                <Input placeholder="1920" />
              )}
            </FormItem>
            <FormItem label="折扣">
              {getFieldDecorator('discount', {
                rules: [{ required: true, message: '请输入折扣!' }],
                initialValue: currentFlt ? currentFlt.discount : undefined,
              })(
                <Input placeholder="6.5" />
              )}
            </FormItem>
          </Form>
        </Modal>
      )
    }
  }
)

export default class FlightList extends React.Component {
  constructor() {
    super()
    this.state = {
      list: [], // 展示数组
      rawList: [], // 原数组
      flightDesc: '',
      sysTime: Date.now(),
      visible: false, // 新建或编辑的弹窗
      currentFlt: undefined, // 当前编辑的航班信息
      exhibitionVis: false // 票价对比的弹窗
    }
    this.columns = [{
      title: '航班号',
      dataIndex: 'flightNo'
    }, {
      title: '起飞时间(PEK)',
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
      title: '降落时间(PEK)',
      dataIndex: 'arrivalTime',
      sorter: (a, b) => {
        let aTime = a.departureTime.split(':'),
          bTime = b.departureTime.split(':'),
          _a = parseInt(aTime[0]) * 60 + parseInt(aTime[1]),
          _b = parseInt(bTime[0]) * 60 + parseInt(bTime[1])
        return _a - _b
      },
    }, {
      title: '机票价格(￥)',
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
              <div>
                <a href="javascript:;" style={{ 'color': 'blue' }} onClick={() => this.showModal('edit', record)}>Edit</a>
                <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.id)}>
                  <a href="javascript:;" style={{ 'color': 'red', marginLeft: '10px' }}>Delete</a>
                </Popconfirm>
              </div>
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
    // this.timer = setInterval(() => this.tickTok(), 1000)
  }
  componentWillUnmount() {
    // clearInterval(this.timer)
  }
  getData() {
    axios.get('http://localhost:1234/flights').then(res => {
      let data = res.data.data
      console.log('data>>', data)
      this.setState({
        list: data.data,
        rawList: data.data,
        flightDesc: data.desc
      })
    })
  }
  onChange(pagination, filters, sorter) {
    // console.log('params', pagination, filters, sorter)
  }

  handleDelete = (id) => {
    console.log('delete id>>>', id)
    const list = [...this.state.list]
    this.setState({ list: list.filter(item => item.id !== id) })
    axios.get('http://localhost:1234/flights/delete', { params: { id } }).then(res => {
      console.log(res.msg)
    })
  }
  handleCancel = () => {
    this.setState({ visible: false, currentFlt: undefined })
  }
  handleCreate = () => {
    const form = this.formRef.props.form
    form.validateFields((err, values) => {
      if (err) {
        return false
      }
      console.log('Received values of form>>>', values)
      axios.get('http://localhost:1234/flights/add', { params: { values } }).then(res => {
        console.log(res)
        let data = res.data.data.data
        this.setState({
          list: data,
          rawList: data
        })
      })
      form.resetFields()
      this.setState({ visible: false })
    })
  }
  handleEdit = () => {
    const form = this.formRef.props.form
    form.validateFields((err, values) => {
      if (err) {
        return false
      }
      console.log('Received edit values of form>>>', values)
      values.id = this.state.currentFlt.id
      axios.get('http://localhost:1234/flights/edit', { params: { values } }).then(res => {
        console.log(res)
        let data = res.data.data.data
        this.setState({
          list: data,
          rawList: data
        })
      })
      form.resetFields()
      this.setState({ visible: false, currentFlt: undefined })
    })
  }
  handleSearch(val) {
    console.log(val)
    val = val.trim()
    if (val) {
      let searchResult = this.state.list.filter((item) => {
        if (item.flightNo.indexOf(val) > -1) {
          return item
        }
      })
      if (searchResult.length) {
        this.setState({ list: searchResult })
      } else {
        this.setState({ list: [] })
      }
    }
  }
  handleClear = () => {
    this.refs.searchRef.input.input.value = ''
    this.setState({ list: this.state.rawList })
  }
  handleExhibite = () => {
    this.setState({
      exhibitionVis: true
    })
  }
  getOption = () => {
    // 浅拷贝
    let list = JSON.parse(JSON.stringify(this.state.list))
    let airlines = [], prices = []
    if (list.length) {
      // 筛选相同航司中的最高价
      list.forEach((item) => {
        item.flightNo = item.flightNo.substr(0, 4)
      })
      console.log('rawList>>>', list)
      let _arr = []
      // for (let i = 0; i < list.length; i++) {
      //   const first = list[i]
      //   // _arr.push(first)
      //   for (let j = i+1; j < list.length; j++) {
      //     const second = list[j]
      //     if(first.flightNo === second.flightNo && first.price < second.price) {
      //       _arr.splice(i,1,second)
      //     } else {
      //       _arr.push(second)
      //     }
      //   }
      // }

      var arr = [1,2,4,4,3,3,1,5,3]

      function res(arr) {
          var tmp = [];
          arr.sort().sort(function (a,b) {
              if(a === b && tmp.indexOf(a) === -1){
                  tmp.push(a)
              }
          })
          return tmp
      }
      var result = res(arr)
      console.log(result )


      list.map((item)=>{
        // item.flight
      })
      console.log('_arr>>>',_arr)
    }
    airlines = ['深圳航空', '中国国航', '东方航空', '海南航空', '南方航空', '中国联航', '奥凯航空']
    prices = [1460, 1920, 1710, 1860, 1920, 1498, 1668]
    return {
      title: {
        text: '航空公司机票价格'
      },
      tooltip: {},
      legend: {
        data: ['最高价']
      },
      xAxis: {
        data: airlines
      },
      yAxis: {},
      series: [{
        name: '最高价',
        type: 'bar',
        data: prices
      }]
    }
  }
  onHideExhibition = () => {
    this.setState({
      exhibitionVis: false
    })
  }
  saveFormRef = (formRef) => {
    this.formRef = formRef
  }
  showModal = (type, record) => {
    this.setState({ visible: true, currentFlt: type === 'edit' ? record : undefined })
  }
  render() {
    return (
      <div>
        <p className="App-intro" onClick={() => this.setState({ flightDesc: 'What\'s up,amigo!' })}>{this.state.flightDesc}</p>
        {/* <p>{this.state.sysTime}</p> */}
        {/* <p>{this.props.tot}</p> */}
        <div className="list-btn">
          <Search
            placeholder="请输入航司，如：深圳航空"
            ref="searchRef"
            onSearch={value => this.handleSearch(value)}
            style={{ width: 400 }}
            enterButton />
          <Button className="clear-btn" onClick={this.handleClear} type="danger"><Icon type="delete" />清空条件</Button>
          <Button className="exhibition-btn" onClick={this.handleExhibite} type="primary"><Icon type="bar-chart" />对比</Button>
          <Button className="create-btn" type="primary" onClick={this.showModal}><Icon type="plus" />Create</Button>
        </div>
        <FlightCreateForm
          wrappedComponentRef={this.saveFormRef}
          currentFlt={this.state.currentFlt}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
          onEdit={this.handleEdit}
        />
        <Modal
          visible={this.state.exhibitionVis}
          onCancel={this.onHideExhibition}
          footer={null}
        >
          <ReactEcharts
            option={this.getOption()}
            style={{ height: '400px', width: '100%' }}
            className='react_for_echarts' />
        </Modal>
        <Table columns={this.columns} dataSource={this.state.list} rowKey={record => record.id} onChange={this.onChange}></Table>
      </div>
    )
  }
}
