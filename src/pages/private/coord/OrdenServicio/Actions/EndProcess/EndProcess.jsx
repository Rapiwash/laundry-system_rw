/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import {
  CancelEntrega_OrdenService,
  UpdateOrdenServices,
} from "../../../../../../redux/actions/aOrdenServices";
import {
  DateCurrent,
  handleGetInfoPago,
} from "../../../../../../utils/functions";

import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { Form, Formik } from "formik";
import * as Yup from "yup";

import Anular from "../Anular/Anular";
import Entregar from "./Entregar/Entregar";
import Pagar from "./Pagar/Pagar";

import { PrivateRoutes } from "../../../../../../models";
import "./endProcess.scss";
import { socket } from "../../../../../../utils/socket/connect";
import { Notify } from "../../../../../../utils/notify/Notify";
import { simboloMoneda } from "../../../../../../services/global";
import { GetDeliveryById } from "../../../../../../services/default.services";

const EndProcess = ({ IdCliente, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [onAction, setOnAction] = useState("principal");

  const InfoNegocio = useSelector((state) => state.negocio.infoNegocio);
  const InfoUsuario = useSelector((state) => state.user.infoUsuario);

  const infoCliente = useSelector((state) =>
    state.orden.registered.find((item) => item._id === IdCliente)
  );
  const InfoLastCuadre = useSelector((state) => state.cuadre.lastCuadre);
  const InfoCuadreActual = useSelector((state) => state.cuadre.cuadreActual);

  const estadoPago = handleGetInfoPago(
    infoCliente.ListPago,
    infoCliente.totalNeto
  );

  const handleValidarCancelacion = async () => {
    if (infoCliente.Modalidad !== "Delivery") {
      await cancelarEntrega("Tienda");
      return;
    }

    const iDeliverys = await GetDeliveryById(IdCliente);
    if (iDeliverys.length === 0) return;

    const deliveryEntregado = iDeliverys.find((delivery) =>
      delivery.descripcion.includes("Devolucion")
    );

    if (!deliveryEntregado) return;

    const puedeCancelar =
      deliveryEntregado.idUser === InfoUsuario._id &&
      (!deliveryEntregado.idCuadre ||
        deliveryEntregado.idCuadre === InfoLastCuadre._id);

    if (!puedeCancelar) {
      alert("Solo el usuario que lo Entrego puede Cancelarlo");
      return;
    }

    await cancelarEntrega("Delivery", deliveryEntregado._id);
  };

  async function cancelarEntrega(modalidad, IdDelivery = null) {
    const payload = { IdCliente, info: { modalidad } };
    if (IdDelivery) payload.info.IdDelivery = IdDelivery;

    const res = await dispatch(CancelEntrega_OrdenService(payload));

    if (res.payload) {
      onClose(false);
    }
  }

  const handleAnular = (infoAnulacion) => {
    dispatch(
      UpdateOrdenServices({
        id: IdCliente,
        infoOrden: { estadoPrenda: "anulado" },
        rol: InfoUsuario.rol,
        infoAnulacion: {
          ...infoAnulacion,
          _id: IdCliente,
          idUser: InfoUsuario._id,
        },
      })
    ).then((res) => {
      if (res.payload) {
        onClose(false);
      }
    });
  };

  const openModalPagar = (values) => {
    modals.openConfirmModal({
      title: "Confirmar Pago",
      centered: true,
      children: (
        <Text size="sm">¿ Estas seguro que quieres realizar el PAGO ?</Text>
      ),
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "green" },
      //onCancel: () => console.log("Cancelado"),
      onConfirm: () => handleEditPago(values),
    });
  };

  const openModalEntregar = (value) => {
    modals.openConfirmModal({
      title: "Confirmar Entrega",
      centered: true,
      children: (
        <Text size="sm">¿ Estas seguro que quieres realizar la ENTREGA ?</Text>
      ),
      labels: { confirm: "Si", cancel: "No" },
      confirmProps: { color: "green" },
      //onCancel: () => console.log("Cancelado"),
      onConfirm: () => handleEditEntrega(value),
    });
  };

  // Pago
  const handleEditPago = async (values) => {
    const newPago = {
      ...values,
      date: {
        fecha: DateCurrent().format4,
        hora: DateCurrent().format3,
      },
      idUser: InfoUsuario._id,
      idCuadre: InfoCuadreActual?.saved
        ? InfoLastCuadre?._id === InfoCuadreActual?._id &&
          InfoLastCuadre?.infoUser._id === InfoCuadreActual?.infoUser._id
          ? InfoCuadreActual?._id
          : ""
        : "",
    };

    // console.log(newPago);

    const newEstadoPago = await handleGetInfoPago(
      [...infoCliente.ListPago, newPago],
      infoCliente.totalNeto
    );
    await dispatch(
      UpdateOrdenServices({
        id: IdCliente,
        infoOrden: {
          ...infoCliente,
          ListPago: [...infoCliente.ListPago, newPago],
          Pago: newEstadoPago.estado,
        },
        rol: InfoUsuario.rol,
      })
    ).then((res) => {
      if (res.payload) {
        onClose();
      }
    });
  };

  // Entregado
  const handleEditEntrega = (iDelivery) => {
    let infoDelivery;
    if (infoCliente.Modalidad === "Delivery") {
      infoDelivery = {
        name: infoCliente.Nombre,
        descripcion: `[${String(infoCliente.codRecibo).padStart(
          4,
          "0"
        )}] Delivery Devolucion en ${iDelivery.tipoTrasporte}`,
        fecha: DateCurrent().format4,
        hora: DateCurrent().format3,
        monto: iDelivery.mDevolucion,
        idUser: InfoUsuario._id,
        idCuadre: InfoCuadreActual?.saved
          ? InfoLastCuadre?._id === InfoCuadreActual?._id &&
            InfoLastCuadre?.infoUser._id === InfoCuadreActual?.infoUser._id
            ? InfoCuadreActual?._id
            : ""
          : "",
      };
    }

    dispatch(
      UpdateOrdenServices({
        id: IdCliente,
        infoOrden: {
          ...infoCliente,
          dateEntrega: {
            fecha: DateCurrent().format4,
            hora: DateCurrent().format3,
          },
          estadoPrenda: "entregado",
          location: 1,
        },
        ...(iDelivery && { infoDelivery }),
        rol: InfoUsuario.rol,
      })
    ).then((res) => {
      if (res.payload) {
        onClose(false);
      }
    });
  };

  const handleEntregar = () => {
    if (infoCliente.Modalidad === "Tienda") {
      openModalEntregar();
    } else {
      setOnAction("concluir");
    }
  };
  const validationSchema = Yup.object().shape({
    tipoTrasporte:
      infoCliente.Modalidad === "Delivery" && infoCliente.Pago === "Completo"
        ? Yup.string().required("Escoja un tipo de transporte")
        : null,
    metodoPago:
      infoCliente.Pago !== "Completo"
        ? Yup.string().required("Escoja Metodo de Pago")
        : null,
    mDevolucion:
      infoCliente.Modalidad === "Delivery" && infoCliente.Pago === "Completo"
        ? Yup.string().required("Escoja Metodo de Pago")
        : null,
    total:
      infoCliente.Pago !== "Completo"
        ? Yup.string().required("Ingrese Monto a Pagar")
        : null,
  });

  const vInitialPago = {
    total: "",
    metodoPago: "",
  };

  const vInitialEntrega = {
    tipoTrasporte: "",
    mDevolucion: "",
  };

  useEffect(() => {
    socket.on("server:orderUpdated:child", (data) => {
      if (infoCliente._id === data._id) {
        if (data.estadoPrenda === "anulado") {
          Notify("ORDERN DE SERVICIO ANULADO", "", "fail");
        } else {
          Notify("ORDERN DE SERVICIO ACTUALIZADO", "", "warning");
        }
        onClose(false);
      }
    });

    socket.on("server:updateListOrder:child", (data) => {
      data.some((orden) => {
        if (infoCliente._id === orden._id) {
          if (orden.estadoPrenda === "donado") {
            Notify("ORDERN DE SERVICIO DONADO", "", "fail");
          } else {
            Notify("ORDERN DE SERVICIO ACTUALIZADO", "", "warning");
          }
          onClose(false);
          return true; // Detener la iteración
        }
        return false; // Continuar la iteración
      });
    });

    return () => {
      // Remove the event listener when the component unmounts
      socket.off("server:orderUpdated:child");
      socket.off("server:updateListOrder:child");
    };
  }, []);

  return (
    <div className="actions-container">
      <div className="header-ac">
        <h1>
          {infoCliente.Nombre.split(" ").slice(0, 1).join(" ")} -{" "}
          {infoCliente.Modalidad}(N°{infoCliente.codRecibo})
        </h1>
      </div>
      <hr />
      <div className="body-ac">
        {onAction === "principal" ? ( // Principal
          <div className="actions-init">
            {/* {infoCliente.estadoPrenda === 'pendiente' ? (
              <button type="button" className="btn-exm" onClick={handleButtonClick}>
                {btnText}
              </button>
            ) : null} */}
            {infoCliente.estadoPrenda === "pendiente" &&
            infoCliente.Pago === "Completo" ? (
              <button
                type="button"
                className="btn-exm"
                onClick={handleEntregar}
              >
                Entregar
              </button>
            ) : null}
            {infoCliente.estadoPrenda === "pendiente" &&
            infoCliente.Pago !== "Completo" ? (
              <button
                type="button"
                className="btn-exm"
                onClick={() => {
                  setOnAction("concluir");
                }}
              >
                Pagar
              </button>
            ) : null}

            {InfoNegocio.rolQAnulan.includes(InfoUsuario.rol) &&
            (infoCliente.dateCreation.fecha === DateCurrent().format4 ||
              infoCliente.Pago === "Pendiente") ? (
              <button
                type="button"
                className="btn-exm"
                onClick={() => setOnAction("anular")}
              >
                Anular
              </button>
            ) : null}
            {infoCliente.estadoPrenda !== "entregado" &&
            infoCliente.modeRegistro !== "antiguo" ? (
              <button
                type="button"
                className="btn-exm"
                onClick={() => {
                  navigate(
                    `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.EDIT_ORDER_SERVICE}/${IdCliente}`
                  );
                }}
              >
                Editar
              </button>
            ) : null}
            {infoCliente.dateEntrega.fecha === DateCurrent().format4 &&
            infoCliente.estadoPrenda === "entregado" ? (
              <button
                type="button"
                className="btn-exm"
                onClick={handleValidarCancelacion}
              >
                Cancelar Entrega
              </button>
            ) : null}
          </div>
        ) : onAction === "concluir" ? (
          <Formik
            initialValues={
              infoCliente.Pago !== "Completo" ? vInitialPago : vInitialEntrega
            }
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
              if (infoCliente.Pago !== "Completo") {
                openModalPagar(values);
              } else {
                openModalEntregar(values);
              }
              // openModalPagarEntregar(values);
              setSubmitting(false);
            }}
          >
            {({
              handleSubmit,
              setFieldValue,
              isSubmitting,
              values,
              errors,
              touched,
            }) => (
              <Form onSubmit={handleSubmit} className="content-pE">
                <div className="trasporte-pago">
                  {infoCliente.Pago !== "Completo" ? (
                    <>
                      <div
                        className="data-pay"
                        style={
                          infoCliente.Pago !== "Pendiente"
                            ? { display: "grid", gap: "15px" }
                            : { display: "flex", gap: "20px" }
                        }
                      >
                        <div style={{ display: "flex", gap: "20px" }}>
                          <div className="item-ipay total">
                            <div className="title">
                              <span>Total</span>
                            </div>
                            <div className="monto">
                              <span>
                                {simboloMoneda} {infoCliente.totalNeto}
                              </span>
                            </div>
                          </div>
                          {infoCliente.Pago !== "Completo" &&
                          infoCliente.ListPago.length > 0 ? (
                            <div className="item-ipay adelanto">
                              <div className="title">
                                <span>Adelanto</span>
                              </div>
                              <div className="monto">
                                <span>
                                  {simboloMoneda} {estadoPago.pago}
                                </span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                        <div className="item-ipay falta">
                          <div className="title">
                            <span>Falta</span>
                          </div>
                          <div className="monto">
                            <span>
                              {simboloMoneda} {estadoPago.falta}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Pagar
                        setFieldValue={setFieldValue}
                        errors={errors}
                        touched={touched}
                        totalToPay={estadoPago.falta}
                      />
                    </>
                  ) : null}
                  {infoCliente.Modalidad === "Delivery" &&
                  infoCliente.Pago === "Completo" ? (
                    <Entregar
                      setFieldValue={setFieldValue}
                      errors={errors}
                      touched={touched}
                      values={values}
                    />
                  ) : null}
                </div>
                <div className="actions-btns">
                  <button
                    type="button"
                    className="btn-exm"
                    onClick={() => setOnAction("principal")}
                  >
                    Retroceder
                  </button>
                  <button
                    className="btn-exm"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Guardar
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <Anular onReturn={setOnAction} onAnular={handleAnular} />
        )}
      </div>
    </div>
  );
};

export default EndProcess;
