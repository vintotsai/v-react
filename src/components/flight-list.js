import React from 'react'
import { Table, Popconfirm, Button, Modal, Form, Input, Radio} from 'antd'
import axios from 'axios'

const FormItem = Form.Item

const FlightCreateForm = Form.create()(
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="新建航班信息"
          okText="新建"
          cancelText="取消"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <FormItem label="航班号">
              {getFieldDecorator('flightNo', {
                rules: [{ required: true, message: '请输入航班号!' }],
              })(
                <Input placeholder="深圳航空ZH9112"/>
              )}
            </FormItem>
            <FormItem label="起飞时间">
              {getFieldDecorator('departureTime', {
                rules: [{ required: true, message: '请输入起飞时间!' }],
              })(
                <Input placeholder="00:00"/>
              )}
            </FormItem>
            <FormItem label="降落时间">
              {getFieldDecorator('arrivalTime', {
                rules: [{ required: true, message: '请输入降落时间!' }],
              })(
                <Input placeholder="00:00"/>
              )}
            </FormItem>
            <FormItem label="机票价格">
              {getFieldDecorator('price', {
                rules: [{ required: true, message: '请输入价格!' }],
              })(
                <Input placeholder="1920"/>
              )}
            </FormItem>
            <FormItem label="折扣">
              {getFieldDecorator('discount', {
                rules: [{ required: true, message: '请输入折扣!' }],
              })(
                <Input placeholder="6.5"/>
              )}
            </FormItem>
          </Form>
        </Modal>
      );
    }
  }
)

export default class FlightList extends React.Component {
  constructor() {
    super()
    this.state = {
      list: [],
      flightDesc: '',
      sysTime: Date.now(),
      visible:false
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
  handleCancel = () => {
    this.setState({ visible: false })
  }
  handleCreate = () => {
    const form = this.formRef.props.form
    form.validateFields((err, values) => {
      if (err) {
        return false
      }

      console.log('Received values of form>>>', values)
      axios.get('http://localhost:1234/flights/add',{params: { values}}).then(res=>{
        console.log(res)
        let data = res.data.data.data
        data.map((item, index) => { item.key = item.id })

        this.setState({
          list: data
        })
      })
      form.resetFields()
      this.setState({ visible: false })

    });
  }
  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }
  showModal = () => {
    this.setState({visible: true})
  }
  render() {
    return (
      <div>
        <p className="App-intro" onClick={() => this.setState({ flightDesc: 'Missing..' })}>{this.state.flightDesc}</p>
        {/* <p>{this.state.sysTime}</p> */}
        {/* <p>{this.props.tot}</p> */}
        <div className="list-btn">
          <Button type="primary" onClick={this.showModal}>新建</Button>
        </div> 
        <FlightCreateForm
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleCreate}
        />
        <Table columns={this.columns} dataSource={this.state.list} onChange={this.onChange}></Table>
      </div>
    )
  }
}
