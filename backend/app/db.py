import os
from typing import List, Optional, Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

# Utilizar la variable de entorno DATABASE_URL
DATABASE_URL = os.environ.get("DATABASE_URL")

def get_db_connection():
    """Establece conexión con la base de datos PostgreSQL"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error al conectar a la base de datos: {e}")
        raise

# Funciones para acceder a los datos de vehículos
def get_vehicle_years() -> List[int]:
    """Obtiene todos los años de vehículos disponibles ordenados de manera descendente"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT DISTINCT year FROM vehicles ORDER BY year DESC")
            years = [row[0] for row in cur.fetchall()]
            return years
    except Exception as e:
        print(f"Error al obtener años de vehículos: {e}")
        return []
    finally:
        conn.close()

def get_vehicle_makes(year: Optional[int] = None) -> List[str]:
    """Obtiene todas las marcas de vehículos disponibles para un año específico"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            if year:
                cur.execute("SELECT DISTINCT make FROM vehicles WHERE year = %s ORDER BY make", (year,))
            else:
                cur.execute("SELECT DISTINCT make FROM vehicles ORDER BY make")
            makes = [row[0] for row in cur.fetchall()]
            return makes
    except Exception as e:
        print(f"Error al obtener marcas de vehículos: {e}")
        return []
    finally:
        conn.close()

def get_vehicle_models(year: Optional[int] = None, make: Optional[str] = None) -> List[str]:
    """Obtiene todos los modelos de vehículos disponibles para un año y marca específicos"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            query = "SELECT DISTINCT model FROM vehicles"
            params = []
            
            where_clauses = []
            if year:
                where_clauses.append("year = %s")
                params.append(year)
            if make:
                where_clauses.append("make = %s")
                params.append(make)
            
            if where_clauses:
                query += " WHERE " + " AND ".join(where_clauses)
            
            query += " ORDER BY model"
            
            cur.execute(query, params)
            models = [row[0] for row in cur.fetchall()]
            return models
    except Exception as e:
        print(f"Error al obtener modelos de vehículos: {e}")
        return []
    finally:
        conn.close()

def get_vehicle_engines(year: Optional[int] = None, make: Optional[str] = None, model: Optional[str] = None) -> List[str]:
    """Obtiene todos los motores de vehículos disponibles para un año, marca y modelo específicos"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            query = "SELECT DISTINCT engine FROM vehicles"
            params = []
            
            where_clauses = []
            if year:
                where_clauses.append("year = %s")
                params.append(year)
            if make:
                where_clauses.append("make = %s")
                params.append(make)
            if model:
                where_clauses.append("model = %s")
                params.append(model)
            
            if where_clauses:
                query += " WHERE " + " AND ".join(where_clauses)
            
            query += " ORDER BY engine"
            
            cur.execute(query, params)
            engines = [row[0] for row in cur.fetchall() if row[0]]  # Filtrar valores nulos
            return engines
    except Exception as e:
        print(f"Error al obtener motores de vehículos: {e}")
        return []
    finally:
        conn.close()

def get_vehicle_by_attributes(year: int, make: str, model: str, engine: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Obtiene un vehículo específico por sus atributos"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = "SELECT * FROM vehicles WHERE year = %s AND make = %s AND model = %s"
            params = [year, make, model]
            
            if engine:
                query += " AND engine = %s"
                params.append(engine)
            
            cur.execute(query, params)
            vehicle = cur.fetchone()
            return dict(vehicle) if vehicle else None
    except Exception as e:
        print(f"Error al obtener vehículo por atributos: {e}")
        return None
    finally:
        conn.close()

def get_all_vehicles(limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
    """Obtiene todos los vehículos con paginación"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM vehicles ORDER BY year DESC, make, model LIMIT %s OFFSET %s",
                (limit, offset)
            )
            vehicles = cur.fetchall()
            return [dict(v) for v in vehicles]
    except Exception as e:
        print(f"Error al obtener todos los vehículos: {e}")
        return []
    finally:
        conn.close()

def count_vehicles() -> int:
    """Cuenta el número total de vehículos en la base de datos"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM vehicles")
            count = cur.fetchone()[0]
            return count
    except Exception as e:
        print(f"Error al contar vehículos: {e}")
        return 0
    finally:
        conn.close()