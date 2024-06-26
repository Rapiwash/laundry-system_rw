/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import OrdenServicio from "../../../../../../components/PRIVATE/OrdenServicio/OrdenServicio";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { AddOrdenServices } from "../../../../../../redux/actions/aOrdenServices";
import LoaderSpiner from "../../../../../../components/LoaderSpinner/LoaderSpiner";
import { setLastRegister } from "../../../../../../redux/states/service_order";

import "./tienda.scss";
import { PrivateRoutes } from "../../../../../../models";

const Tienda = () => {
  const [redirect, setRedirect] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { lastRegister } = useSelector((state) => state.orden);

  const handleRegistrar = async (data) => {
    try {
      const { infoOrden, infoPago, rol } = data;

      // Crear la nueva orden con los datos necesarios
      const nuevaOrden = {
        infoOrden: {
          ...infoOrden,
          estado: "registrado",
          tipoRegistro: "normal",
        },
        infoPago,
        rol,
      };

      // Despachar la acción y esperar la respuesta
      const res = await dispatch(AddOrdenServices(nuevaOrden));

      // Verificar la respuesta y ajustar la redirección
      if (res?.error) {
        console.error("Error en el servicio al agregar la orden:", res.error);
        setRedirect(false);
      } else {
        setRedirect(true);
      }
    } catch (error) {
      console.error("Error al registrar la orden:", error);
      setRedirect(false);
    }
  };

  useEffect(() => {
    if (lastRegister !== null) {
      const getId = lastRegister._id;
      dispatch(setLastRegister());
      navigate(
        `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.IMPRIMIR_ORDER_SERVICE}/${getId}`
      );
    }
  }, [lastRegister]);

  return (
    <>
      {redirect === false ? (
        <div className="content-tienda">
          <OrdenServicio
            titleMode="REGISTRAR"
            mode={"NEW"}
            onAction={handleRegistrar}
            infoDefault={null}
          />
        </div>
      ) : (
        <div className="loading-general">
          <LoaderSpiner />
        </div>
      )}
    </>
  );
};

export default Tienda;
