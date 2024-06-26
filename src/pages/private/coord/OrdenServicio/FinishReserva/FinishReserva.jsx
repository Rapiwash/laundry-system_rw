import { useNavigate, useParams } from "react-router-dom";
import OrdenServicio from "../../../../../components/PRIVATE/OrdenServicio/OrdenServicio";

import { useDispatch, useSelector } from "react-redux";

import { FinalzarReservaOrdenService } from "../../../../../redux/actions/aOrdenServices";
import { setOrderServiceId } from "../../../../../redux/states/service_order";

import { PrivateRoutes } from "../../../../../models";
import "./finishReserva.scss";

const FinishReserva = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const ordenReservada = useSelector((state) =>
    state.orden.reserved.find((item) => item._id === id)
  );

  const handleFinishReserva = async (updateData) => {
    const { infoOrden, infoPago, rol } = updateData;

    const {
      dateRecepcion,
      Modalidad,
      Nombre,
      idCliente,
      Items,
      celular,
      direccion,
      datePrevista,
      descuento,
      dni,
      subTotal,
      totalNeto,
      cargosExtras,
      factura,
      modoDescuento,
      gift_promo,
      attendedBy,
    } = infoOrden;

    try {
      const res = await dispatch(
        FinalzarReservaOrdenService({
          id,
          infoOrden: {
            codRecibo: ordenReservada.codRecibo,
            dateRecepcion,
            Modalidad,
            Nombre,
            idCliente,
            Items,
            celular,
            direccion,
            datePrevista,
            descuento,
            dni,
            subTotal,
            totalNeto,
            cargosExtras,
            factura,
            modoDescuento,
            gift_promo,
            attendedBy,
          },
          infoPago,
          rol,
        })
      );

      if (res.payload) {
        dispatch(setOrderServiceId(false));
        navigate(
          `/${PrivateRoutes.PRIVATE}/${PrivateRoutes.IMPRIMIR_ORDER_SERVICE}/${id}`
        );
      }
    } catch (error) {
      console.error("Error al finalizar reserva:", error);
      // Manejar el error según tu lógica de aplicación
    }
  };

  return (
    <>
      {ordenReservada ? (
        <div className="edit-orden-service">
          <OrdenServicio
            titleMode="REGISTRAR"
            mode="FINISH_RESERVA"
            onAction={handleFinishReserva}
            infoDefault={ordenReservada}
          />
        </div>
      ) : (
        <>
          <div>Loading...</div>
        </>
      )}
    </>
  );
};

export default FinishReserva;
