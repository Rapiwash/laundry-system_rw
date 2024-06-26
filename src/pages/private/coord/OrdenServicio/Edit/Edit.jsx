import { useNavigate, useParams } from "react-router-dom";
import OrdenServicio from "../../../../../components/PRIVATE/OrdenServicio/OrdenServicio";

import { useDispatch, useSelector } from "react-redux";

import { UpdateDetalleOrdenServices } from "../../../../../redux/actions/aOrdenServices";

import { PrivateRoutes } from "../../../../../models";
import "./edit.scss";
import moment from "moment";

const Editar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const ordenToUpdate = useSelector((state) =>
    state.orden.registered.find((item) => item._id === id)
  );
  const iUsuario = useSelector((state) => state.user.infoUsuario);

  const handleEditarDetalle = async (updateData) => {
    const { infoOrden, infoPago, rol } = updateData;
    const { Items } = infoOrden;

    try {
      await dispatch(
        UpdateDetalleOrdenServices({
          id,
          infoOrden: {
            Items,
            lastEdit: [
              ...ordenToUpdate.lastEdit,
              {
                name: iUsuario.name,
                date: moment().format("YYYY-MM-DD HH:mm"),
              },
            ],
          },
          infoPago,
          rol,
        })
      );

      navigate(`/${PrivateRoutes.PRIVATE}/${PrivateRoutes.LIST_ORDER_SERVICE}`);
    } catch (error) {
      console.error("Error al editar detalle de la orden:", error);
    }
  };

  return (
    <>
      {ordenToUpdate ? (
        <div className="edit-orden-service">
          <OrdenServicio
            titleMode="ACTUALIZAR"
            mode="UPDATE"
            onAction={handleEditarDetalle}
            infoDefault={ordenToUpdate}
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

export default Editar;
