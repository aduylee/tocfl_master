import {useState} from "react";
import {register} from "../service/authservice";


function Register(){


    const [form,setForm] = useState({

        username:"",
        email:"",
        password:""

    });



    const handleChange = (
        e:React.ChangeEvent<HTMLInputElement>
    )=>{

        setForm({

            ...form,

            [e.target.name]:e.target.value

        });

    };



    const handleRegister = async()=>{


        try{


            const result = await register(form);



            alert(result.message);



            setForm({

                username:"",
                email:"",
                password:""

            });



        }catch(error:any){


            alert(
                error.message || 
                "Đăng ký thất bại"
            );


        }


    };




    return (

        <div className="
            min-h-screen 
            flex 
            items-center 
            justify-center
            bg-gray-100
        ">


            <div className="
                bg-white
                p-8
                rounded-lg
                shadow
                w-96
            ">


                <h1 className="
                    text-3xl
                    font-bold
                    text-center
                ">
                    Đăng ký TOCFL Master
                </h1>



                <input

                    name="username"

                    value={form.username}

                    onChange={handleChange}

                    placeholder="Tên người dùng"

                    className="
                    border
                    p-3
                    w-full
                    mt-5
                    rounded
                    "

                />



                <input

                    name="email"

                    value={form.email}

                    onChange={handleChange}

                    placeholder="Email"

                    className="
                    border
                    p-3
                    w-full
                    mt-3
                    rounded
                    "

                />



                <input

                    name="password"

                    value={form.password}

                    onChange={handleChange}

                    placeholder="Mật khẩu"

                    type="password"

                    className="
                    border
                    p-3
                    w-full
                    mt-3
                    rounded
                    "

                />



                <button

                    onClick={handleRegister}

                    className="
                    bg-red-600
                    text-white
                    w-full
                    py-3
                    mt-5
                    rounded
                    hover:bg-red-700
                    "

                >

                    Đăng ký

                </button>



            </div>


        </div>

    );


}


export default Register;