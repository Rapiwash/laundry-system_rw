/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "./reportes.scss";
import { Link } from "react-router-dom";
import { PrivateRoutes, Roles } from "../../../../models";
import Ordenes from "./Ordenes/Ordenes";
import Gasto from "./Gastos/Gasto";
import Portal from "../../../../components/PRIVATE/Portal/Portal";
import Target from "../../../../components/Target/Target";

import Iconos from "../../../../utils/img/Icono/index";

const {
  iRCuadreCaja,
  iRGastos,
  iRPendiente,
  iRPortafolio,
  iRMensual,
  iRAlmacen,
} = Iconos;

import Backgrounds from "../../../../utils/img/Background/index";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
const {
  rBCuadredCaja,
  rBGastos,
  rBPendiente,
  rBPortafolio,
  rBMensual,
  rBAlmacen,
} = Backgrounds;

const Reportes = () => {
  const [mMensual, setMMensual] = useState(false);
  const [mGasto, setMGasto] = useState(false);
  const InfoUsuario = useSelector((store) => store.user.infoUsuario);
  const navigate = useNavigate();

  const handleValidarAcceso = (type, page, accesos) => {
    const hasPermission = accesos.includes(InfoUsuario.rol);

    if (hasPermission) {
      if (type === "modal") {
        if (page === "Gastos") {
          setMGasto(true);
        } else if (page === "Ordenes") {
          setMMensual(true);
        } else {
          alert("Error: Pagina no Econtrada");
        }
      } else {
        navigate(page);
      }
    } else {
      alert("No tienes Acceso a estos reportes");
    }
  };

  const listReports = [
    {
      imgIco: iRPendiente,
      imgBack: rBPendiente,
      type_show: "page",
      acceso: [Roles.ADMIN, Roles.MASTER],
      title: "Ordenes Pendientes",
      descripcion:
        "Listado Ordenes pendiente, tiempo en custodia, reenviar Almacen",
      page: `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.REPORTE_PENDIENTES}`,
    },
    {
      imgIco: iRGastos,
      imgBack: rBGastos,
      type_show: "modal",
      acceso: [Roles.ADMIN, Roles.MASTER],
      title: "Gastos",
      descripcion:
        "Margen de gasto Mensual, exportacion excel, flujo de gastos",
      page: "Gastos",
    },
    {
      imgIco: iRPortafolio,
      imgBack: rBPortafolio,
      type_show: "page",
      acceso: [Roles.MASTER],
      title: "Productos y Servicios",
      descripcion:
        "Listado Ordenes pendiente, tiempo en custodia, reenviar Almacen",
      page: `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.REPORTE_PRODUCTOS}`,
    },
    {
      imgIco: iRCuadreCaja,
      imgBack: rBCuadredCaja,
      type_show: "page",
      acceso: [Roles.ADMIN, Roles.MASTER],
      title: "Cuadres de Caja",
      descripcion:
        "Listado Cuadres Diarios y Movimientos no Guardados o Cuadrados, exportar a excel",
      page: `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.REPORTE_CUADRE_CAJA}`,
    },
    {
      imgIco: iRMensual,
      imgBack: rBMensual,
      type_show: "modal",
      acceso: [Roles.MASTER],
      title: "Ordenes Mensual",
      descripcion:
        "Listado Ordenes mensual, exportacion en excel, montos pagados y facturados",
      page: "Ordenes",
    },

    {
      imgIco: iRAlmacen,
      imgBack: rBAlmacen,
      type_show: "page",
      acceso: [Roles.ADMIN, Roles.MASTER],
      title: "Almacen",
      descripcion:
        "Listado Ordenes en Almacen, tiempo en custodia, Enviar a DONACION",
      page: `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.REPORTE_ALMACEN}`,
    },
  ];

  const items = listReports.map((report, index) => {
    const modelTarg = (
      <Target
        title={report.title}
        descripcion={report.descripcion}
        imgIco={report.imgIco}
        imgBack={report.imgBack}
      />
    );

    return (
      <li key={index}>
        <button
          className="card-report"
          onClick={() =>
            handleValidarAcceso(report.type_show, report.page, report.acceso)
          }
        >
          {modelTarg}
        </button>
      </li>
    );
  });

  return (
    <div className="content-reportes">
      <ul className="cards">
        {items}
        {mMensual && (
          <Portal
            onClose={() => {
              setMMensual(false);
            }}
          >
            <Ordenes onClose={() => setMMensual(false)} />
          </Portal>
        )}
        {mGasto && (
          <Portal
            onClose={() => {
              setMGasto(false);
            }}
          >
            <Gasto onClose={() => setMGasto(false)} />
          </Portal>
        )}
      </ul>
    </div>
  );
};

export default Reportes;
