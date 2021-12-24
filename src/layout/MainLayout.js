import React, {useState, useEffect} from 'react'
import './layout.css'
import { Layout, Menu, Input, Modal, Button, message } from 'antd';
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    DatabaseOutlined,
    UsergroupAddOutlined,
    UserSwitchOutlined
} from '@ant-design/icons';
const { Header, Sider, Content } = Layout;
import {useFormik } from 'formik';
import * as Yup from 'yup';
import {
    validateToken
} from '../utils/web3.storage'
import { 
    useHistory,
    Link
} from "react-router-dom";
import {
    createKeyPair,
    encryptStringTypeData
} from '../utils/keypair.utils'
import {saveFile} from '../utils/file.utils'
import {fetchUserInfo} from '../store/slice/user.slice'
import { unwrapResult } from '@reduxjs/toolkit'
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash'


const { TextArea } = Input;

const signupValidationSchema = Yup.object().shape({
    token: Yup.string().test('Validate password', 'Invalid Token', value => {
        return new Promise((resolve, reject) => {
            validateToken(value).then(result => {
                resolve(result)
            })
        });
        
    }).required('Invalid Web3 storage token')
});

const loginValidationSchema = Yup.object().shape({
    seedPhrase: Yup.string().test('Validate password', 'Invalid password', value => {
        return value.length > 12
        
    }).required('Invalid Web3 storage token')
});

export default function MainLayout({children}) {

    let history = useHistory();
    const dispatch = useDispatch()

    const [collapsed, setCollapsed] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalLoginVisible, setIsModalLoginVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isHideLayout, setHideLayout] = useState(false);

    useEffect(() => {
        const currentURL = window.location.href
        if (currentURL.includes('login')) {
            setHideLayout(true)
        } else {
            setHideLayout(false)
        }
    }, [])

    const {current} = useSelector(state => state.user)

    const formik = useFormik({
        initialValues: {
            token: '',
        },
        validationSchema: signupValidationSchema,
        onSubmit: async (values) => {
            const {accountId} = await window.walletConnection.account()
            setLoading(true);
            const {privateKey, publicKey} = createKeyPair();
            const blob = new Blob([privateKey], { type: "text/plain;charset=utf-8" });
            saveFile(blob, `${accountId}_private_key.txt`)
            const {success, cipher} = await encryptStringTypeData(publicKey, values.token)
            if (success) {
                window.localStorage.setItem(`${accountId}_private_key`, privateKey)
                window.localStorage.setItem(`${accountId}_web3_storage_token`, values.token)
                const current = new Date().getTime()
                await window.contract.sign_up({_public_key: publicKey, _encrypted_token: cipher, _created_at: current})
                setIsModalVisible(false)
                history.go(0)
            } else {
                message.error('Fail to sign up')
            }
        }
    })

    const loginFormik = useFormik({
        initialValues: {
            seedPhrase: '',
        },
        validationSchema: loginValidationSchema,
        onSubmit: async (values) => {
            window.localStorage.setItem(`${accountId}_private_key`, values.seedPhrase)
            history.go(0)
        }
    })

    const {values, errors, handleChange, handleSubmit, setFieldValue} = formik
    const {
        values: loginValues, 
        errors: loginErrors, 
        handleChange: loginHandleChange, 
        handleSubmit: loginHandleSubmit, 
        setFieldValue: loginSetFieldValue,
    } = loginFormik

    const toggle = () => {
        setCollapsed(!collapsed)
    }

    const showModal = () => {
        setIsModalVisible(true);
    };
    
    const handleOk = () => {
        handleSubmit()
    };
    
    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const showLoginModal = () => {
        setIsModalLoginVisible(true);
    };

    const handleLoginOk = () => {

    }

    useEffect(() => {
        if (!current.success && current.status === 1) {
            showModal()
        }
    }, [current])

    useEffect(() => {
        const checkBeforeEnter = async () => {
            const private_key = window.localStorage.getItem(`${accountId}_private_key`)
            const response = await dispatch(fetchUserInfo(private_key))
            const result = unwrapResult(response)
            const {success, status} = result
            if (!success) {
                if (status === 1) {
                    showModal()
                } else {
                    setIsModalLoginVisible(true)
                    return
                }
            }
        }
        checkBeforeEnter()
    }, [])

    const redirect = (path) => {
        history.push(path)
        history.go(0)
    }

    return (
        <div id="page-layout-trigger">
            {isHideLayout ? <div>{children}</div> : <Layout>
                <Sider trigger={null} collapsible collapsed={collapsed}>
                    <div className="logo"></div>
                    <Menu theme="dark" mode="inline">
                        <Menu.Item key="1" icon={<DatabaseOutlined />} onClick={() => redirect("/")}>
                            My Folders
                        </Menu.Item>
                        <Menu.Item key="2" icon={<UsergroupAddOutlined />} onClick={() => redirect("/shared")}>
                            Shared Folders
                        </Menu.Item>
                        <Menu.Item key="4" icon={<UserSwitchOutlined />} onClick={() => redirect("/shared_with_me")}>
                            Shared With Me
                        </Menu.Item>
                    </Menu>
                </Sider>
                <Layout className="site-layout">
                    <Header className="site-layout-background" style={{ padding: 0 }}>
                        <div className="d-flex justify-content-between">
                            <div>
                                {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                                    className: 'trigger',
                                    onClick: toggle,
                                })}
                            </div>
                            <div className="account">
                                {current.account}
                            </div>
                        </div>
                    </Header>
                    <Content
                        className="site-layout-background"
                        style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        }}
                    >
                        {children}
                    </Content>
                </Layout>
            </Layout>}
            <Modal
                visible={isModalLoginVisible}
                title="Your private key"
                onOk={loginHandleSubmit}
                footer={[
                    <Button
                        loading={loading}
                        type="primary"
                        onClick={loginHandleSubmit}
                        key="signup button"
                    >
                        Login
                    </Button>,
                ]}
            >
                <div className="input-group mb-3">
                    <label className="form-label">Password</label>
                    <TextArea 
                        placeholder="Private key" 
                        onChange={loginHandleChange('seedPhrase')}
                    />
                    {loginErrors.seedPhrase && <span className="error-text">{loginErrors.seedPhrase}</span>}
                </div>
            </Modal>
            <Modal
                visible={isModalVisible}
                title="Web3 Storage token is required"
                onOk={handleOk}
                footer={[
                    <Button
                        loading={loading}
                        type="primary"
                        onClick={handleOk}
                        key="signup button"
                    >
                        Register
                    </Button>,
                ]}
            >
                <div className="input-group mb-3">
                    <label className="form-label">Web3Storage Token</label>
                    <TextArea 
                        placeholder="Web3Storage Token" 
                        onChange={handleChange('token')}
                    />
                    {errors.token && <span className="error-text">{errors.token}</span>}
                </div>
            </Modal>
        </div>
    )
}
